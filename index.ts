import express, { ErrorRequestHandler } from 'express'
import fetch from 'node-fetch'

import Kilt from '@kiltprotocol/sdk-js'
import { generateRandom, encryptAndStore, retrieveAndDecrypt } from './utils'

Kilt.config({
  address: 'wss://full-nodes.kilt.io',
})

const getStoredIdentity = async () => {
  const store: any = await retrieveAndDecrypt()
  return Kilt.Identity.buildFromURI(store.identity)
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
    const ddo = did.createDefaultDidDocument(
      'https://services.kilt.io/messaging'
    )

    const signedDdo = Kilt.Did.signDidDocument(ddo, identity)

    const contact = {
      did: signedDdo,
      metaData: {
        name: signedDdo.id,
      },
      publicIdentity: identity.getPublicIdentity(),
    }

    const response = await fetch('https://services.kilt.io/contacts', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      method: 'POST',
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
