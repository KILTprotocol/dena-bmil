import Kilt, { IAttestation } from '@kiltprotocol/sdk-js'
import VCUtils from '@kiltprotocol/vc-export'
import fetch from 'node-fetch'
import { BASE_POST_PARAMS } from '../fetch'
import {
  storeCredential,
  getStoredRequest,
  store,
  retrieve,
  removeRequest,
} from '../helper'
import { OLIBoxCredentialCtype } from '../const'

export const handleAttestationMessage = async (attestation: IAttestation) => {
  console.log(attestation)
  const request = await getStoredRequest()
  const energyWebRequests = await retrieve('energyWebRequests')
  if (request && request.rootHash === attestation.claimHash) {
    console.log('✅ Attestation matches previous Request')
    const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
      request,
      attestation
    )
    await storeCredential(credential)
    console.log('👍 Credential stored!')

    if (process.env.EWF_URL) {
      console.log('📤 exporting to VC and sending to the EWF app')
      const VC = VCUtils.fromAttestedClaim(credential, OLIBoxCredentialCtype)
      // TODO: make a presentation?

      VC.type = [...VC.type, 'BMILInstallationCredential']

      const wrapForEwf = {
        subject_did: VC.credentialSubject['@id'],
        credential: VC,
      }

      console.log(JSON.stringify(wrapForEwf, undefined, 4))

      const response = await fetch(process.env.EWF_URL, {
        ...BASE_POST_PARAMS,
        body: JSON.stringify(wrapForEwf),
      })

      if (response.ok) {
        console.log('👍 Credential sent!')
      } else {
        console.error(response.status, response.statusText)
      }
    }
  } else if (
    energyWebRequests &&
    Array.isArray(energyWebRequests) &&
    energyWebRequests.length
  ) {
    const energyWebRequest = energyWebRequests.find(
      (request) => request.rootHash === attestation.claimHash
    )

    if (energyWebRequest) {
      console.log(
        '✅ Attestation matches previous Request: EnergyWeb Role Credential'
      )
      const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
        energyWebRequest,
        attestation
      )

      let credentials: any[] = []
      const oldCredentials = await retrieve('energyWebCredentials')
      if (oldCredentials && oldCredentials.length) {
        credentials = [...oldCredentials]
      }
      credentials.push(credential)

      await store('energyWebCredentials', credentials)
      await removeRequest(energyWebRequest)
      console.log('👍 Credential stored!')
    }
  } else {
    console.log("❌ Couldn't find corresponding request")
  }
}
