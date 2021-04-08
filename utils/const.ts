import Kilt, { IPublicIdentity } from '@kiltprotocol/sdk-js'
import { MESSAGING_URL } from './fetch'

export const attester: IPublicIdentity = {
  address: '4tb4hAdiN9C5L4ycwFLR7wGcQrx4r8qSh15RFACwNwDmAeM5',
  boxPublicKeyAsHex:
    '0x0f7cece0e9ce82743d889e7d2ca1c54896d4d5bb942226176d80234bb0ebb04c',
  serviceAddress: MESSAGING_URL,
}

export const delegationRootId = "0xe5059302753ec79d6cbfaffdbd1f6e0eb55a6c016d94af10d224014242173b95"

export const excludedClaimProperties = ['Laengengrad', 'Breitengrad']

export const ctype = Kilt.CType.fromCType({
  schema: {
    $schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'BMIL_Anlagedaten',
    properties: {
      Einheitentyp: {
        type: 'string',
      },
      Besitzer: {
        type: 'string',
      },
      Inbetriebnahmedatum: {
        type: 'string',
        format: 'date',
      },
      Postleitzahl: {
        type: 'integer',
      },
      Ort: {
        type: 'string',
      },
      Art_Koordinatenangabe: {
        type: 'string',
      },
      Laengengrad: {
        type: 'string',
      },
      Breitengrad: {
        type: 'string',
      },
      Nettonennleistung_PV_Stromspeicher: {
        type: 'integer',
      },
      Nettonennleistung_Biomasse_Wasser: {
        type: 'integer',
      },
      Nettonennleistung_Verbrennung_Kernenergie: {
        type: 'integer',
      },
      Nettonennleistung_Wind: {
        type: 'integer',
      },
      Netzanschlussart: {
        type: 'string',
      },
      Abmeldedatum: {
        type: 'string',
        format: 'date',
      },
    },
    type: 'object',
    $id:
      'kilt:ctype:0x001b0560ebee835f73a8c8b91391af8f3a8da985d5a7816e2c4aa0d787440374',
  },
  owner: '4rC2bbX2AC6Hptw45KmFNBGi1varGFujBFcBVAZKEZvLiVDe',
  hash: '0x001b0560ebee835f73a8c8b91391af8f3a8da985d5a7816e2c4aa0d787440374',
})
