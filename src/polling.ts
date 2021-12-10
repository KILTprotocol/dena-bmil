import fetch from 'node-fetch'
import Kilt, {
  Identity,
  IEncryptedMessage,
  PublicIdentity,
} from '@kiltprotocol/sdk-js'
import { getStoredIdentity } from './utils/helper'
import { MESSAGING_URL, BASE_DELETE_PARAMS } from './utils/fetch'
import {
  handleAttestationMessage,
  handleRequestClaimMessage,
  handleSubmitTermsMessage,
} from './utils/messageHandling'

const deleteMessage = (messageId: string, identity: Identity) => {
  const signature = identity.signStr(messageId)
  return fetch(`${MESSAGING_URL}/${messageId}`, {
    ...BASE_DELETE_PARAMS,
    headers: { signature },
  })
}

const handleMessages = async (messages: IEncryptedMessage[]) => {
  const identity = await getStoredIdentity()
  if (!identity) return

  for (const encrypted of messages) {
    const decryted = Kilt.Message.decrypt(encrypted, identity)
    const sender = new PublicIdentity(
      decryted.senderAddress,
      decryted.senderBoxPublicKey
    )
    try {
      switch (decryted.body.type) {
        case Kilt.Message.BodyType.SUBMIT_ATTESTATION_FOR_CLAIM:
          const { attestation } = decryted.body.content
          console.log(
            `⏱  Processing Attestation submission from ${decryted.senderAddress}`
          )
          await handleAttestationMessage(attestation)
          break
        case Kilt.Message.BodyType.REQUEST_CLAIMS_FOR_CTYPES:
          const ctypes = decryted.body.content.map(
            (request) => request.cTypeHash
          )
          console.log(
            `⏱  Processing Request For Claims from ${decryted.senderAddress}`
          )
          await handleRequestClaimMessage(ctypes, identity, sender)
          break
        case Kilt.Message.BodyType.SUBMIT_TERMS:
          const { claim, delegationId } = decryted.body.content
          console.log(`⏱  Processing Terms from ${decryted.senderAddress}`)
          await handleSubmitTermsMessage(identity, sender, claim, delegationId)
      }
    } catch (e) {
      throw e
    } finally {
      if (decryted.messageId) await deleteMessage(decryted.messageId, identity)
    }
  }
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
