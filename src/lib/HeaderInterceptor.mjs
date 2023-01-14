import {
  SESSION_ID_REQUEST_HEADER_KEY,
  SESSION_ID_RESPONSE_HEADER_KEY,

  REQUEST_ID_REQUEST_HEADER_KEY,

  API_KEY_REQUEST_HEADER_KEY,

  ACCESS_TOKEN_REQUEST_HEADER_KEY,
  ACCESS_TOKEN_RESPONSE_HEADER_KEY,

  ENCRYPTION_KEY_REQUEST_HEADER_KEY,

  CLIENT_ID_REQUEST_HEADER_KEY,

  APP_UID_REQUEST_HEADER_KEY,
  APP_UID_RESPONSE_HEADER_KEY
} from '../CONSTANTS/HEADERS.mjs'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess (config) {
  const { webHttp: { } } = config

  config.headers[SESSION_ID_REQUEST_HEADER_KEY] = ''
  config.headers[REQUEST_ID_REQUEST_HEADER_KEY] = ''
  config.headers[API_KEY_REQUEST_HEADER_KEY] = ''
  config.headers[ACCESS_TOKEN_REQUEST_HEADER_KEY] = ''
  config.headers[ENCRYPTION_KEY_REQUEST_HEADER_KEY] = ''
  config.headers[CLIENT_ID_REQUEST_HEADER_KEY] = ''
  config.headers[APP_UID_REQUEST_HEADER_KEY] = ''
}

function responseSuccess (response) {
}

function responseError (error) {
  throw error
}
