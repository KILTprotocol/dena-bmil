import Kilt, {
  BlockchainUtils,
  ChainHelpers,
  CType,
  CTypeSchemaWithoutId,
  ICTypeMetadata,
  Identity,
  init,
} from '@kiltprotocol/sdk-js'
import fetch from 'node-fetch'

Kilt.config({
  address: 'ws://127.0.0.1:9944',
})

const SERVICES_URL = 'http://127.0.0.1:3001'

const newCtypeSchema: CTypeSchemaWithoutId = {
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
}

const metadata: ICTypeMetadata = {
  ctypeHash:
    '0x7b431dfb20a2344939712d28c384e8198ed08f6f505b5153f6ea64704bae61c9',
  metadata: {
    title: {
      default: 'BMILInstallationCredential',
    },
    description: {
      default: '',
    },
    properties: {
      owner: {
        title: {
          default: 'owner',
        },
      },
      facility_type: {
        title: {
          default: 'facility type',
        },
      },
      registration_date: {
        title: {
          default: 'registration date',
        },
      },
      deregistration_date: {
        title: {
          default: 'deregistration date',
        },
      },
      zip_code: {
        title: {
          default: 'zip code',
        },
      },
      city: {
        title: {
          default: 'city',
        },
      },
      country: {
        title: {
          default: 'country',
        },
      },
      latitude: {
        title: {
          default: 'latitude',
        },
      },
      longitude: {
        title: {
          default: 'longitude',
        },
      },
      nominal_capacity: {
        title: {
          default: 'nominal capacity',
        },
      },
      grid_connection: {
        title: {
          default: 'grid connection',
        },
      },
      name: {
        title: {
          default: 'name',
        },
      },
      device_manufacturer: {
        title: {
          default: 'device manufacturer',
        },
      },
      device_model: {
        title: {
          default: 'device model',
        },
      },
      device_serialnumber: {
        title: {
          default: 'device serialnumber',
        },
      },
      device_address: {
        title: {
          default: 'device address',
        },
      },
      device_sunspec_did: {
        title: {
          default: 'device sunspec_did',
        },
      },
    },
  },
}

async function makeNewCtype() {
  await init()
  const identity = Identity.buildFromMnemonic(
    'receive clutch item involve chaos clutch furnace arrest claw isolate okay together',
    {
      signingKeyPairType: 'ed25519',
    }
  )
  const newCtypeToStore = CType.fromSchema(newCtypeSchema, identity.address)

  // Anchor to blockchain
  const tx = await newCtypeToStore.store()

  try {
    await BlockchainUtils.signAndSubmitTx(tx, identity)
  } catch (e) {
    if (
      e.errorCode ===
      ChainHelpers.ExtrinsicErrors.CType.ERROR_CTYPE_ALREADY_EXISTS.code
    ) {
      console.log('Ctype already exists. Skipping...')
    } else {
      throw e
    }
  }

  console.log(newCtypeToStore.hash, newCtypeToStore.schema.$id)

  const ctypeWithMeta = {
    cType: newCtypeToStore,
    metaData: metadata,
  }
  // Register in services
  console.log('Registering ctype in services')
  await fetch(`${SERVICES_URL}/ctype`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: 'POST',
    body: JSON.stringify(ctypeWithMeta),
  })

  process.exit(0)
}

makeNewCtype()
