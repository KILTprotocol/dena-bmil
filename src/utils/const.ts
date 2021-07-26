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

export const BMILInstallationCredentialCtype = Kilt.CType.fromCType({
  schema: {
    $schema: 'http://kilt-protocol.org/draft-01/ctype#',
    title: 'BMILInstallationCredential',
    properties: {
      owner: {
        type: 'string',
      },
      facility_type: {
        type: 'string',
      },
      registration_date: {
        type: 'string',
        format: 'date',
      },
      deregistration_date: {
        type: 'string',
        format: 'date',
      },
      zip_code: {
        type: 'string',
      },
      city: {
        type: 'string',
      },
      country: {
        type: 'string',
      },
      latitude: {
        type: 'number',
      },
      longitude: {
        type: 'number',
      },
      nominal_capacity: {
        type: 'number',
      },
      grid_connection: {
        type: 'string',
      },
      device_manufacturer: {
        type: 'string',
      },
      device_model: {
        type: 'string',
      },
      device_serialnumber: {
        type: 'string',
      },
      device_address: {
        type: 'string',
      },
      device_sunspec_did: {
        type: 'string',
      },
    },
    type: 'object',
    $id: 'kilt:ctype:0xf3f981d9ed4559d9303455826b06bc7048a76107d96185cc31e491cadeafec9e',
  },
  owner: '4pZRhNcdBSVjCDQbarnpuNPusvLkXf6364BUDG82rXhzFMMr',
  hash: '0xf3f981d9ed4559d9303455826b06bc7048a76107d96185cc31e491cadeafec9e',
})

export const BMILInstallationCredentialDelegationRootId =
  '0xdf671bfa6fdc2ea9ec8439dc194e23689cfdc9d27e609333e5dd06511a57db4e'

export const BMILInstallationCredentialExcludedClaimProperties = [
  'latitude',
  'longitude',
]
