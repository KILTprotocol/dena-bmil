import Kilt from '@kiltprotocol/sdk-js'
import { retrieveAndDecrypt, encryptAndStore } from './crypto'

export const getStoredIdentity = async () => {
  const store: any = await retrieveAndDecrypt()
  if (store.identity) {
    return Kilt.Identity.buildFromURI(store.identity, {
      signingKeyPairType: 'ed25519',
    })
  }
}

export const storeRequest = async (request: any) => {
  const store: any = await retrieveAndDecrypt()
  const newStore = {
    ...store,
    request,
  }
  await encryptAndStore(newStore)
}

export const getStoredRequest = async () => {
  const store: any = await retrieveAndDecrypt()
  if (store.request) {
    return Kilt.RequestForAttestation.fromRequest(store.request)
  }
}

export const storeCredential = async (credential: any) => {
  const store: any = await retrieveAndDecrypt()
  const newStore = {
    ...store,
    credential,
  }
  delete newStore.request
  await encryptAndStore(newStore)
}

export const getStoredCredential = async () => {
  const store: any = await retrieveAndDecrypt()
  if (store.credential)
    return Kilt.AttestedClaim.fromAttestedClaim(store.credential)
}
