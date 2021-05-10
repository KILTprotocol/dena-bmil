import fetch from 'node-fetch'
import Kilt, {
  AttestedClaim,
  IAttestation,
  Identity,
  IEncryptedMessage,
  IPublicIdentity,
  IRequestAttestationForClaim,
  ISubmitClaimsForCTypes,
  Message,
  PartialClaim,
} from '@kiltprotocol/sdk-js'
import {
  getStoredIdentity,
  storeCredential,
  getStoredRequest,
  getStoredCredential,
  storeRequest,
} from './utils/helper'
import {
  MESSAGING_URL,
  BASE_DELETE_PARAMS,
  BASE_POST_PARAMS,
} from './utils/fetch'
import { attester, ctype, delegationRootId, excludedClaimProperties } from './utils/const'

const deleteMessage = (messageId: string, identity: Identity) => {
  const signature = identity.signStr(messageId)
  return fetch(`${MESSAGING_URL}/${messageId}`, {
    ...BASE_DELETE_PARAMS,
    headers: { signature },
  })
}

const handleAttestationMessage = async (attestation: IAttestation) => {
  console.log(attestation)
  const request = await getStoredRequest()
  if (request) {
    console.log('✅ Attestation matches previous Request')
    const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
      request,
      attestation
    )
    await storeCredential(credential)
    console.log('👍 Credential stored!')
  }
}

const handleRequestClaimMessage = async (
  ctypes: string[],
  identity: Identity,
  verifier: IPublicIdentity
) => {
  const credential = await getStoredCredential()
  const foundCtype = ctypes.find((ctypeHash) => {
    if (credential?.request.claim.cTypeHash === ctypeHash) {
      return credential
    }
  })

  if (foundCtype && credential) {
    console.log('✅ Found a credential for provided ctype')


    const attClaim = new AttestedClaim(
      // clone the attestation and request for attestation because properties will be deleted later.
      JSON.parse(
        JSON.stringify({
          request: credential.request,
          attestation: credential.attestation,
        })
      )
    )

    attClaim.request.removeClaimProperties(excludedClaimProperties)

    const messageBody: ISubmitClaimsForCTypes = {
      content: [attClaim],
      type: Kilt.Message.BodyType.SUBMIT_CLAIMS_FOR_CTYPES,
    }
    const message = new Message(messageBody, identity, verifier)
    const encrypted = message.encrypt()

    const response = await fetch(MESSAGING_URL, {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(encrypted),
    })

    if (response.ok) {
      console.log('👍 Credential sent!')
    }
  }
  else {
    console.log(`❌ No credential found for provided ctypes!`)
  }
}

const handleSubmitTermsMessage = async (
  identity: Identity,
  claim: PartialClaim,
  delegationId?: string,
) => {
  if (claim.cTypeHash === ctype.hash && delegationId) {
    
    const delegationNode = await Kilt.DelegationNode.query(delegationId)
    const delegationRootNode = await delegationNode?.getRoot()

    console.log('✅ CTYPE matches')

    if (
      delegationNode &&
      delegationRootNode &&
      delegationRootNode.id === delegationRootId
    ) {
      console.log('✅ Delegation Root matches')
      const newClaim = Kilt.Claim.fromCTypeAndClaimContents(
        ctype,
        {
          ...claim.contents,
        },
        identity.address
      )

      const requestForAttestation = Kilt.RequestForAttestation.fromClaimAndIdentity(
        newClaim,
        identity,
        {
          delegationId,
        }
      )

      const messageBody: IRequestAttestationForClaim = {
        content: { requestForAttestation },
        type: Kilt.Message.BodyType.REQUEST_ATTESTATION_FOR_CLAIM,
      }
      const message = new Message(messageBody, identity, attester)
      const encrypted = message.encrypt()

      const response = await fetch(MESSAGING_URL, {
        ...BASE_POST_PARAMS,
        body: JSON.stringify(encrypted),
      })

      if (response.ok) {
        await storeRequest(requestForAttestation)
        console.log('👍 Terms accepted and Request For Attestation signed and sent!')
      }
    } else {
      console.log('❌ Delegation root node does not match!')
    }
  }
  else {
    console.log(`❌ Ctype doesn't match!`)
  }
}

const handleMessages = async (messages: IEncryptedMessage[]) => {
  const identity = await getStoredIdentity()
  if (!identity) return
  messages.forEach(async (encrypted) => {
    const decryted = Kilt.Message.decrypt(encrypted, identity)
    try {
      switch (decryted.body.type) {
        case Kilt.Message.BodyType.SUBMIT_ATTESTATION_FOR_CLAIM:
          const { attestation } = decryted.body.content
          console.log(`⏱  Processing Attestation submission from ${decryted.senderAddress}`)
          await handleAttestationMessage(attestation)
          break
        case Kilt.Message.BodyType.REQUEST_CLAIMS_FOR_CTYPES:
          const ctypes = decryted.body.content.map(request => request.cTypeHash)
          console.log(`⏱  Processing Request For Claims from ${decryted.senderAddress}`)
          await handleRequestClaimMessage(ctypes, identity, {
            address: decryted.senderAddress,
            boxPublicKeyAsHex: decryted.senderBoxPublicKey,
          })
          break
        case Kilt.Message.BodyType.SUBMIT_TERMS:
          const { claim, delegationId } = decryted.body.content
          console.log(`⏱  Processing Terms from ${decryted.senderAddress}`)
          await handleSubmitTermsMessage(identity, claim, delegationId)
      }
    } catch (e) {
      throw e
    } finally {
      if (decryted.messageId) await deleteMessage(decryted.messageId, identity)
    }
  })
}

// Polling services
export const poll = async () => {
  const executePoll = async () => {
    const identity = await getStoredIdentity()
    if (!identity) {
      return setTimeout(executePoll, 10000)
    }
    try {
      const response = await fetch(`${MESSAGING_URL}/inbox/${identity.address}`)
      if (response.ok) {
        const messages = await response.json()
        if (messages && messages.length > 0) await handleMessages(messages)
      }
    } catch (e) {
      console.error(e)
    }
    setTimeout(executePoll, 2000)
  }
  executePoll()
}
