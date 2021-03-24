import express from 'express'
import fetch from 'node-fetch'
import Kilt, {
  Identity,
  IEncryptedMessage,
  IPublicIdentity,
  IRequestAttestationForClaim,
  Message,
} from '@kiltprotocol/sdk-js'
import { generateRandom, encryptAndStore, retrieveAndDecrypt } from './utils'

const BASE_POST_PARAMS = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  method: 'POST',
}

const BASE_DELETE_PARAMS = {
  method: 'DELETE',
}

const BASE_URL = 'https://services.kilt.io'
const MESSAGING_URL = `${BASE_URL}/messaging`

Kilt.config({
  address: 'wss://full-nodes.kilt.io',
})

const getStoredIdentity = async () => {
  const store: any = await retrieveAndDecrypt()
  return Kilt.Identity.buildFromURI(store.identity)
}

const storeRequest = async (request: any) => {
  const store: any = await retrieveAndDecrypt()
  const newStore = {
    ...store,
    request,
  }
  encryptAndStore(newStore)
}

const getStoredRequest = async () => {
  const store: any = await retrieveAndDecrypt()
  if (store.request) {
    return Kilt.RequestForAttestation.fromRequest(store.request)
  }
}

const storeCredential = async (credential: any) => {
  const store: any = await retrieveAndDecrypt()
  const newStore = {
    ...store,
    credential,
  }
  delete newStore.request
  encryptAndStore(newStore)
}

const app = express()
const port = 3000

app.post('/identity', (req, res) => {
  generateRandom().then((random) => {
    const identity = Kilt.Identity.buildFromURI(`0x${random}`)
    encryptAndStore({ identity: identity.seedAsHex })
    res.send(identity.address)
  })
})

app.get('/identity', async (req, res) => {
  const identity = await getStoredIdentity()
  res.send(identity.address)
})

app.post('/identity/register', async (req, res, next) => {
  try {
    const identity = await getStoredIdentity()
    const did = Kilt.Did.fromIdentity(identity)
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

app.post('/claim', async (req, res) => {
  const identity = await getStoredIdentity()
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
    type: Kilt.MessageBodyType.REQUEST_ATTESTATION_FOR_CLAIM,
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

  res.send('Finished')
})

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      message: err.message,
      stack: err.stack?.split('\n'),
    })
  }
)

const deleteMessage = (messageId: string, identity: Identity) => {
  const signature = identity.signStr(messageId)
  return fetch(`${MESSAGING_URL}/${messageId}`, {
    ...BASE_DELETE_PARAMS,
    headers: { signature },
  })
}

const handleMessages = async (messages: IEncryptedMessage[]) => {
  const identity = await getStoredIdentity()
  messages.forEach(async (encrypted) => {
    const decryted = Kilt.Message.decrypt(encrypted, identity)
    if (
      decryted.body.type === Kilt.MessageBodyType.SUBMIT_ATTESTATION_FOR_CLAIM
    ) {
      const { attestation } = decryted.body.content
      console.log(attestation)
      const request = await getStoredRequest()
      try {
        if (request) {
          const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
            request,
            attestation
          )
          storeCredential(credential)
        }
      } catch (e) {
        throw e
      } finally {
        if (decryted.messageId) deleteMessage(decryted.messageId, identity)
      }
    }
  })
}

// Polling services
const poll = async () => {
  const identity = await getStoredIdentity()

  const executePoll = async () => {
    try {
      const response = await fetch(`${MESSAGING_URL}/inbox/${identity.address}`)
      if (response.ok) {
        const messages = await response.json()
        if (messages && messages.length > 0) handleMessages(messages)
      }
    } catch (e) {
      console.error(e)
    }
    setTimeout(executePoll, 2000)
  }
  executePoll()
}
poll()

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
