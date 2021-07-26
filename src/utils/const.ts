import Kilt from '@kiltprotocol/sdk-js'

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
