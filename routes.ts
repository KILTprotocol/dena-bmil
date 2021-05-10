import express from 'express'
import fetch from 'node-fetch'
import Kilt, {
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
import { ctype, attester } from './utils/const'

Kilt.config({
  address: 'wss://full-nodes.kilt.io',
})

const router = express.Router()

router.post('/reset', (req, res) => {
  encryptAndStore({}).then(() => {
    console.log('👍 Application reset!')
    res.json('Finished')
  })
})

router.post('/identity', (req, res) => {
  generateRandom().then((random) => {
    const identity = Kilt.Identity.buildFromURI(`0x${random}`, {
      signingKeyPairType: 'ed25519',
    })
    encryptAndStore({ identity: identity.seedAsHex }).then(() => {
      console.log('👍 New identity created and stored!')
      res.json(identity.address)
    })
  })
})

router.get('/identity', async (req, res) => {
  const identity = await getStoredIdentity()
  if (!identity?.address) {
    throw Error('No identity stored')
  }
  console.log('👍 Stored identity returned!')
  res.json(identity.address)
})

router.post('/identity/register', async (req, res, next) => {
  try {
    const identity = await getStoredIdentity()
    if (!identity) {
      throw Error('No identity stored')
    }
    console.log(`⏱  Starting to register identity as DID`)
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

    console.log('✅ Off-chain DID document stored')

    const tx = await did.store(identity)
    const txResult = await Kilt.BlockchainUtils.submitSignedTx(tx, {
      resolveOn: Kilt.BlockchainUtils.IS_IN_BLOCK,
    })

    console.log('👍 Identity successfully registered as DID on chain!')

    res.json(ddo)
  } catch (e) {
    next(e)
  }
})

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

  console.log('👍 Example claim generated and Request For Attestation sent!')

  res.json('Finished')
})

router.get('/credential', async (req, res) => {
  const credential = await getStoredCredential()
  console.log('👍 Stored credential returned!')
  res.json(credential)
})

export default router
