import fetch from 'node-fetch'
import Kilt, {
  AttestedClaim,
  Identity,
  IPublicIdentity,
  ISubmitClaimsForCTypes,
  Message,
} from '@kiltprotocol/sdk-js'
import { getStoredCredential, getStoredEnergyWebCredentials } from '../helper'
import { MESSAGING_URL, BASE_POST_PARAMS } from '../fetch'
import {
  BMILInstallationCredentialExcludedClaimProperties,
  BMILInstallationCredentialCtype,
  EnergyWebCtype,
} from '../const'

export const handleRequestClaimMessage = async (
  ctypes: string[],
  identity: Identity,
  verifier: IPublicIdentity
) => {
  const credential = await getStoredCredential()
  const energyWebCredentials = await getStoredEnergyWebCredentials()
  const foundCtype = ctypes.find((ctypeHash) => {
    if (
      BMILInstallationCredentialCtype.hash === ctypeHash ||
      EnergyWebCtype.hash === ctypeHash
    ) {
      return true
    }
  })

  if (
    foundCtype &&
    foundCtype === credential?.request.claim.cTypeHash &&
    credential
  ) {
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

    attClaim.request.removeClaimProperties(
      BMILInstallationCredentialExcludedClaimProperties
    )

    const messageBody: ISubmitClaimsForCTypes = {
      content: [attClaim],
      type: Kilt.Message.BodyType.SUBMIT_CLAIMS_FOR_CTYPES,
    }
    const message = new Message(
      messageBody,
      identity.getPublicIdentity(),
      verifier
    )
    const encrypted = message.encrypt(identity, verifier)

    const response = await fetch(MESSAGING_URL, {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(encrypted),
    })

    if (response.ok) {
      console.log('👍 Credential sent!')
    }
  } else if (
    foundCtype &&
    foundCtype === energyWebCredentials?.[0].request.claim.cTypeHash &&
    energyWebCredentials
  ) {
    console.log('✅ Found a credential for provided ctype')

    const messageBody: ISubmitClaimsForCTypes = {
      content: [...energyWebCredentials],
      type: Kilt.Message.BodyType.SUBMIT_CLAIMS_FOR_CTYPES,
    }
    const message = new Message(
      messageBody,
      identity.getPublicIdentity(),
      verifier
    )
    const encrypted = message.encrypt(identity, verifier)

    const response = await fetch(MESSAGING_URL, {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(encrypted),
    })

    if (response.ok) {
      console.log('👍 Credential sent!')
    }
  } else {
    console.log(`❌ No credential found for provided ctypes!`)
  }
}
