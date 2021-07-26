import Kilt, { IPublicIdentity } from '@kiltprotocol/sdk-js'
import { MESSAGING_URL } from './fetch'

export const BMILAnlagedatenAttester: IPublicIdentity = {
  address: '4oTwFGDLgK4nUpnVTYkW8rAYxCG3Noedhcz5YNzWsoxwU3J1',
  boxPublicKeyAsHex:
    '0xd507eda0658bd2f1a170143525879c343b0635307ed2d17daf4c07e8b161e637',
  serviceAddress: MESSAGING_URL,
}

export const BMILAnlagedatenDelegationRootId =
  '0x24c8098ed324b03e602402c8e97bc8524f44ff23c4ca9d2343ff278bed809400'

export const BMILAnlagedatenExcludedClaimProperties = ['Laengengrad', 'Breitengrad']

export const BMILAnlagedatenCtype = Kilt.CType.fromCType({
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
    $id: 'kilt:ctype:0x001b0560ebee835f73a8c8b91391af8f3a8da985d5a7816e2c4aa0d787440374',
  },
  owner: '4rC2bbX2AC6Hptw45KmFNBGi1varGFujBFcBVAZKEZvLiVDe',
  hash: '0x001b0560ebee835f73a8c8b91391af8f3a8da985d5a7816e2c4aa0d787440374',
})

export const EnergyWebCtype = Kilt.CType.fromCType({
  schema: {
    $schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'EnergyWeb Role Credential',
    properties: {
      role: {
        type: 'string',
      },
    },
    type: 'object',
    $id: 'kilt:ctype:0x59afdc96e89af9b342d1bde1b7ba5375124275f04e1f4a3459df3266957e3791',
  },
  owner: '4rQ2vmWQsxcKwxjzLcPqke593vNiJ6p6sc6zdUus6PTTVLU6',
  hash: '0x59afdc96e89af9b342d1bde1b7ba5375124275f04e1f4a3459df3266957e3791',
})

export const OLIBoxCredentialCtype = Kilt.CType.fromCType({
  schema: {
    $schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'OLIBox Credential',
    properties: {
      manufacturer: {
        type: 'string',
      },
      model: {
        type: 'string',
      },
      serialnumber: {
        type: 'string',
      },
      deviceaddress: {
        type: 'string',
      },
      sunspec_did: {
        type: 'string',
      },
    },
    type: 'object',
    $id: 'kilt:ctype:0xab35d11a267edae7d069123c7a8de5b2077c9a9c9f7b9e64ae9a48fc52ae169f',
  },
  owner: '4rQ2vmWQsxcKwxjzLcPqke593vNiJ6p6sc6zdUus6PTTVLU6',
  hash: '0xab35d11a267edae7d069123c7a8de5b2077c9a9c9f7b9e64ae9a48fc52ae169f',
})

export const OLIBoxCredentialDelegationRootId =
  '0x04e797b7f77364b4be4c2fb95e5de03e00becb3bb7cf72a38c01eb6850c90274'
