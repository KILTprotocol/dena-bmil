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
      name: {
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
    $id: 'kilt:ctype:0x7b431dfb20a2344939712d28c384e8198ed08f6f505b5153f6ea64704bae61c9',
  },
  owner: '4pZRhNcdBSVjCDQbarnpuNPusvLkXf6364BUDG82rXhzFMMr',
  hash: '0x7b431dfb20a2344939712d28c384e8198ed08f6f505b5153f6ea64704bae61c9',
})

export const BMILInstallationCredentialDelegationRootId =
  '0x99957ba9475d27d42d2dfb112947424189a7bf6cdd2c1f457d6b366c89375f45'

export const BMILInstallationCredentialExcludedClaimProperties = [
  'latitude',
  'longitude',
]
