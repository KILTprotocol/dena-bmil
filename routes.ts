import express from 'express'
import fetch from 'node-fetch'
import Kilt, {
  IPublicIdentity,
  IRequestAttestationForClaim,
  Message,
} from '@kiltprotocol/sdk-js'
import {
  getStoredCredential,
  getStoredIdentity,
  storeRequest,
} from './utils/helper'
import { MESSAGING_URL, BASE_POST_PARAMS, CONTACTS_URL } from './utils/fetch'
import { generateRandom, encryptAndStore } from './utils/crypto'

Kilt.config({
  address: 'wss://full-nodes.kilt.io',
})

const router = express.Router()

router.post('/reset', (req, res) => {
  encryptAndStore({})
  res.json('Finished')
})

router.post('/identity', (req, res) => {
  generateRandom().then((random) => {
    const identity = Kilt.Identity.buildFromURI(`0x${random}`, {
      signingKeyPairType: 'ed25519',
    })
    encryptAndStore({ identity: identity.seedAsHex })
    res.json(identity.address)
  })
})

router.get('/identity', async (req, res) => {
  const identity = await getStoredIdentity()
  if (!identity?.address) {
    throw Error('No identity stored')
  }
  res.json(identity.address)
})

router.post('/identity/register', async (req, res, next) => {
  try {
    const identity = await getStoredIdentity()
    if (!identity) {
      throw Error('No identity stored')
    }
    const documentStore = `${CONTACTS_URL}/${identity.address}`
    const did = Kilt.Did.fromIdentity(identity, documentStore)
    const ddo = did.createDefaultDidDocument(MESSAGING_URL)

    const signedDdo = Kilt.Did.signDidDocument(ddo, identity)

    const contact = {
      did: signedDdo,
      metaData: {
        name: signedDdo.id,
      },
      publicIdentity: identity.getPublicIdentity(),
    }

    const response = await fetch('https://services.kilt.io/contacts', {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(contact),
    })

    if (!response.ok) {
      throw Error(
        'Error while storing DID Document in services: ' + response.statusText
      )
    }

    const tx = await did.store(identity)
    const txResult = await Kilt.BlockchainUtils.submitSignedTx(tx, {
      resolveOn: Kilt.BlockchainUtils.IS_IN_BLOCK,
    })

    res.json(ddo)
  } catch (e) {
    next(e)
  }
})

const ctype = Kilt.CType.fromCType({
  schema: {
    $id:
      'kilt:ctype:0x5366521b1cf4497cfe5f17663a7387a87bb8f2c4295d7c40f3140e7ee6afc41b',
    $schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'DriversLicense',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
    },
    type: 'object',
  },
  owner: '4tf4mVShDTGaqZCRHjhH3Wyg9iXuGkKi14mRFVbvq5Tnmk7J',
  hash: '0x5366521b1cf4497cfe5f17663a7387a87bb8f2c4295d7c40f3140e7ee6afc41b',
})

const attester: IPublicIdentity = {
  address: '4qK4AzHMBQVGKUURU2AJq9Ch8ozgSFEngmo87S7cggqK6kJW',
  boxPublicKeyAsHex:
    '0x57172b4336a091a06e0a1c5dbbd2a3a70ff953f2bb4a9de439ab4397f734d714',
  serviceAddress: MESSAGING_URL,
}

router.post('/claim', async (req, res) => {
  const identity = await getStoredIdentity()
  if (!identity) {
    throw Error('No identity stored')
  }
  const claim = Kilt.Claim.fromCTypeAndClaimContents(
    ctype,
    {
      name: 'OLI',
      age: 20,
    },
    identity.address
  )

  const requestForAttestation = Kilt.RequestForAttestation.fromClaimAndIdentity(
    claim,
    identity
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
  }

  res.json('Finished')
})

router.get('/credential', async (req, res) => {
  const credential = await getStoredCredential()
  res.json(credential)
})

export default router
