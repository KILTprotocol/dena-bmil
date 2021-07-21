import fetch from 'node-fetch'
import Kilt, {
  Identity,
  IPublicIdentity,
  IRequestAttestationForClaim,
  Message,
  PartialClaim,
} from '@kiltprotocol/sdk-js'
import { storeRequest, store } from '../helper'
import { MESSAGING_URL, BASE_POST_PARAMS } from '../fetch'
import { ctype, delegationRootId, energyWebCtype } from '../const'

export const handleSubmitTermsMessage = async (
  identity: Identity,
  sender: IPublicIdentity,
  claim: PartialClaim,
  delegationId?: string
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

      const requestForAttestation =
        Kilt.RequestForAttestation.fromClaimAndIdentity(newClaim, identity, {
          delegationId,
        })

      const messageBody: IRequestAttestationForClaim = {
        content: { requestForAttestation },
        type: Kilt.Message.BodyType.REQUEST_ATTESTATION_FOR_CLAIM,
      }
      const message = new Message(
        messageBody,
        identity.getPublicIdentity(),
        sender
      )
      const encrypted = message.encrypt(identity, sender)

      const response = await fetch(MESSAGING_URL, {
        ...BASE_POST_PARAMS,
        body: JSON.stringify(encrypted),
      })

      if (response.ok) {
        await storeRequest(requestForAttestation)
        console.log(
          '👍 Terms accepted and Request For Attestation signed and sent!'
        )
      }
    } else {
      console.log('❌ Delegation root node does not match!')
    }
  } else if (claim.cTypeHash === energyWebCtype.hash) {
    console.log('✅ CTYPE matches: EnergyWeb Role Credential')

    const newClaim = Kilt.Claim.fromCTypeAndClaimContents(
      energyWebCtype,
      {
        ...claim.contents,
      },
      identity.address
    )

    const requestForAttestation =
      Kilt.RequestForAttestation.fromClaimAndIdentity(newClaim, identity)

    const messageBody: IRequestAttestationForClaim = {
      content: { requestForAttestation },
      type: Kilt.Message.BodyType.REQUEST_ATTESTATION_FOR_CLAIM,
    }
    const message = new Message(
      messageBody,
      identity.getPublicIdentity(),
      sender
    )
    const encrypted = message.encrypt(identity, sender)

    const response = await fetch(MESSAGING_URL, {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(encrypted),
    })

    if (response.ok) {
      await store('energyWebRequest', requestForAttestation)
      console.log(
        '👍 Terms accepted and Request For Attestation signed and sent!'
      )
    }
  } else {
    console.log(`❌ Ctype doesn't match!`)
  }
}
