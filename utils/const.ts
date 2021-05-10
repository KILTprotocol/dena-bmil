import Kilt, { IPublicIdentity } from '@kiltprotocol/sdk-js'
import { MESSAGING_URL } from './fetch'

export const attester: IPublicIdentity = {
  address: '4oTwFGDLgK4nUpnVTYkW8rAYxCG3Noedhcz5YNzWsoxwU3J1',
  boxPublicKeyAsHex:
    '0xd507eda0658bd2f1a170143525879c343b0635307ed2d17daf4c07e8b161e637',
  serviceAddress: MESSAGING_URL,
}

export const delegationRootId = "0x7d65d67d6bb547e6f5df19be7fc21593ee374ea34730c21ea3a623b042de56c4"

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
