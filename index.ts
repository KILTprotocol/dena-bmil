import express from 'express'
import fetch from 'node-fetch'
import Kilt, {
  IAttestation,
  Identity,
  IEncryptedMessage,
  IPublicIdentity,
  ISubmitClaimsForCTypes,
  Message,
} from '@kiltprotocol/sdk-js'
import {
  getStoredIdentity,
  storeCredential,
  getStoredRequest,
  getStoredCredential,
} from './utils/helper'
import {
  MESSAGING_URL,
  BASE_DELETE_PARAMS,
  BASE_POST_PARAMS,
} from './utils/fetch'
import routes from './routes'

const app = express()
const port = 3000

app.use(routes)

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

const handleAttestationMessage = async (attestation: IAttestation) => {
  console.log(attestation)
  const request = await getStoredRequest()
  if (request) {
    const credential = Kilt.AttestedClaim.fromRequestAndAttestation(
      request,
      attestation
    )
    await storeCredential(credential)
  }
}

const handleRequestClaimMessage = async (
  ctypes: string[],
  identity: Identity,
  verifier: IPublicIdentity
) => {
  const credential = await getStoredCredential()
  const foundCtype = ctypes.find((ctypeHash) => {
    if (credential?.request.claim.cTypeHash === ctypeHash) {
      return credential
    }
  })

  if (foundCtype && credential) {
    const messageBody: ISubmitClaimsForCTypes = {
      content: [credential],
      type: Kilt.Message.BodyType.SUBMIT_CLAIMS_FOR_CTYPES,
    }
    const message = new Message(messageBody, identity, verifier)
    const encrypted = message.encrypt()

    const response = await fetch(MESSAGING_URL, {
      ...BASE_POST_PARAMS,
      body: JSON.stringify(encrypted),
    })
  }
}

const handleMessages = async (messages: IEncryptedMessage[]) => {
  const identity = await getStoredIdentity()
  if (!identity) return
  messages.forEach(async (encrypted) => {
    const decryted = Kilt.Message.decrypt(encrypted, identity)
    try {
      switch (decryted.body.type) {
        case Kilt.Message.BodyType.SUBMIT_ATTESTATION_FOR_CLAIM:
          const { attestation } = decryted.body.content
          handleAttestationMessage(attestation)
          break
        case Kilt.Message.BodyType.REQUEST_CLAIMS_FOR_CTYPES:
          const { ctypes } = decryted.body.content
          handleRequestClaimMessage(ctypes, identity, {
            address: decryted.senderAddress,
            boxPublicKeyAsHex: decryted.senderBoxPublicKey
          })
          break
      }
    } catch (e) {
      throw e
    } finally {
      if (decryted.messageId) deleteMessage(decryted.messageId, identity)
    }
  })
}

// Polling services
const poll = async () => {
  const identity = await getStoredIdentity()

  if (!identity) {
    return setTimeout(poll, 10000)
  }

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
