import { config } from 'dotenv'
config()

export const BASE_POST_PARAMS = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  method: 'POST',
}

export const BASE_DELETE_PARAMS = {
  method: 'DELETE',
}

export const BASE_URL = process.env.SERVICES_URL || 'https://services.kilt.io'
export const MESSAGING_URL = `${BASE_URL}/messaging`
export const CONTACTS_URL = `${BASE_URL}/contacts`
