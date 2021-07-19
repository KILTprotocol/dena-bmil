import Kilt, {
  IAttestation,
} from '@kiltprotocol/sdk-js'
import {
  storeCredential,
  getStoredRequest,
  store,
  retrieve,
} from '../helper'

export const handleAttestationMessage = async (attestation: IAttestation) => {
  console.log(attestation)
  const request = await getStoredRequest()
  const energyWebRequest = await retrieve('energyWebRequest')
  if (request && request.rootHash === attestation.claimHash) {
    console.log('✅ Attestation matches previous Request')
    const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
      request,
      attestation
    )
    await storeCredential(credential)
    console.log('👍 Credential stored!')
  } else if (energyWebRequest && energyWebRequest.rootHash === attestation.claimHash) {
    console.log(
      '✅ Attestation matches previous Request: EnergyWeb Role Credential'
    )
    const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
      energyWebRequest,
      attestation
    )
    await store('energyWebCredential', credential, 'energyWebRequest')
    console.log('👍 Credential stored!')
  }
}
