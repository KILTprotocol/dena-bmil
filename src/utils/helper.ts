import Kilt from '@kiltprotocol/sdk-js'
import { retrieveAndDecrypt, encryptAndStore } from './crypto'

export const store = async (key: string, value: any, remove?: string) => {
  const store: any = await retrieveAndDecrypt()
  const newStore = {
    ...store,
    [key]: value,
  }
  if (remove) {
    delete newStore[remove]
  }
  await encryptAndStore(newStore)
}

export const retrieve = async (key: string) => {
  const store: any = await retrieveAndDecrypt()
  if (!store[key]) {
    return false
  }
  return store[key]
}

export const getStoredIdentity = async () => {
  const identity = await retrieve('identity')
  if (identity) {
    return Kilt.Identity.buildFromURI(identity, {
      signingKeyPairType: 'ed25519',
    })
  }
}

export const storeRequest = async (request: any) => {
  return store('request', request)
}

export const getStoredRequest = async () => {
  const request = await retrieve('request')
  if (request) {
    return Kilt.RequestForAttestation.fromRequest(request)
  }
}

export const storeCredential = async (credential: any) => {
  return store('credential', credential, 'request')
}

export const getStoredCredential = async () => {
  const credential = await retrieve('credential')
  if (credential) {
    return Kilt.AttestedClaim.fromAttestedClaim(credential)
  }
}

export const getStoredEnergyWebCredential = async () => {
  const credential = await retrieve('energyWebCredential')
  if (credential) {
    return Kilt.AttestedClaim.fromAttestedClaim(credential)
  }
}
