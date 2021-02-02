import Kilt from '@kiltprotocol/sdk-js'
import { generateRandom, encryptAndStore, retrieveAndDecrypt } from './utils'

generateRandom().then((random) => {
  const identity = Kilt.Identity.buildFromURI(`0x${random}`)
  console.log(identity.seedAsHex)
})

encryptAndStore({ hello: 'Oli' })
retrieveAndDecrypt().then((message) => {
  console.log(message)
})
