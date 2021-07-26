import fetch from 'node-fetch'
import fs from 'fs'
import Kilt, {
  Identity,
  IPublicIdentity,
  IRequestAttestationForClaim,
  IRequestForAttestation,
  Message,
  PartialClaim,
} from '@kiltprotocol/sdk-js'
import { storeRequest, store, retrieve } from '../helper'
import { MESSAGING_URL, BASE_POST_PARAMS } from '../fetch'
import {
  EnergyWebCtype,
  OLIBoxCredentialCtype,
  OLIBoxCredentialDelegationRootId,
} from '../const'

export const sendReq4AttMessage = (
  requestForAttestation: IRequestForAttestation,
  identity: Identity,
  receiver: IPublicIdentity
) => {
  const messageBody: IRequestAttestationForClaim = {
    content: { requestForAttestation },
    type: Kilt.Message.BodyType.REQUEST_ATTESTATION_FOR_CLAIM,
  }
  const message = new Message(
    messageBody,
    identity.getPublicIdentity(),
    receiver
  )
  const encrypted = message.encrypt(identity, receiver)

  return fetch(MESSAGING_URL, {
    ...BASE_POST_PARAMS,
    body: JSON.stringify(encrypted),
  })
}

export const handleSubmitTermsMessage = async (
  identity: Identity,
  sender: IPublicIdentity,
  claim: PartialClaim,
  delegationId?: string
) => {
  // BMIL Credential
  if (claim.cTypeHash === OLIBoxCredentialCtype.hash && delegationId) {
    const delegationNode = await Kilt.DelegationNode.query(delegationId)
    const delegationRootNode = await delegationNode?.getRoot()

    console.log('✅ CTYPE matches')

    if (
      delegationNode &&
      delegationRootNode &&
      delegationRootNode.id === OLIBoxCredentialDelegationRootId
    ) {
      console.log('✅ Delegation Root matches')

      const claimContents = claim.contents || {}

      let masterData
      if (process.env.MASTER_DATA) {
        try {
          await fs.promises.access(process.env.MASTER_DATA, fs.constants.R_OK)
          const data = await fs.promises.readFile(process.env.MASTER_DATA)
          masterData = JSON.parse(data.toString())
        } catch (e) {
          console.error("Couldn't access or read master data file")
        }
      }

      if (masterData) {
        const {
          c_manufacturer,
          c_model,
          c_serialnumber,
          c_deviceaddress,
          c_sunspec_did,
        } = masterData

        claimContents.manufacturer = c_manufacturer
        claimContents.model = c_model
        claimContents.serialnumber = c_serialnumber
        claimContents.deviceaddress = c_deviceaddress.toString()
        claimContents.sunspec_did = c_sunspec_did.toString()
      }

      const newClaim = Kilt.Claim.fromCTypeAndClaimContents(
        OLIBoxCredentialCtype,
        {
          ...claimContents,
        },
        identity.address
      )

      const requestForAttestation =
        Kilt.RequestForAttestation.fromClaimAndIdentity(newClaim, identity, {
          delegationId,
        })

      const response = await sendReq4AttMessage(
        requestForAttestation,
        identity,
        sender
      )

      if (response.ok) {
        await storeRequest(requestForAttestation)
        console.log(
          '👍 Terms accepted and Request For Attestation signed and sent!'
        )
      }
    } else {
      console.log('❌ Delegation root node does not match!')
    }

    // EnergyWebRole Credential
  } else if (claim.cTypeHash === EnergyWebCtype.hash) {
    console.log('✅ CTYPE matches: EnergyWeb Role Credential')

    const newClaim = Kilt.Claim.fromCTypeAndClaimContents(
      EnergyWebCtype,
      {
        ...claim.contents,
      },
      identity.address
    )

    const requestForAttestation =
      Kilt.RequestForAttestation.fromClaimAndIdentity(newClaim, identity)

    const response = await sendReq4AttMessage(
      requestForAttestation,
      identity,
      sender
    )

    if (response.ok) {
      let requests: any[] = []
      const oldRequests = await retrieve('energyWebRequests')
      if (oldRequests && oldRequests.length) {
        requests = [...oldRequests]
      }
      requests.push(requestForAttestation)
      await store('energyWebRequests', requests)

      console.log(
        '👍 Terms accepted and Request For Attestation signed and sent!'
      )
    }
  } else {
    console.log(`❌ Ctype doesn't match!`)
  }
}
