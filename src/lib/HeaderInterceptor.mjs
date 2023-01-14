import { v4 } from 'uuid'
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

import {
  ACCESS_TOKEN_CONTEXT_KEY,
  SESSION_ID_CONTEXT_KEY,
  API_KEY_CONTEXT_KEY,
  APP_UID_CONTEXT_KEY,
  CLIENT_ID_CONTEXT_KEY
} from '../CONSTANTS/CONTEXT.mjs'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess (config) {
  const {
    webHttpContext,
    webHttpCconfig: {
      encryptedEncryptionKey = ''
    } = {}
  } = config

  config.headers[SESSION_ID_REQUEST_HEADER_KEY] = webHttpContext.get(SESSION_ID_CONTEXT_KEY)
  config.headers[REQUEST_ID_REQUEST_HEADER_KEY] = v4().replaceAll('-', '')
  config.headers[API_KEY_REQUEST_HEADER_KEY] = webHttpContext.get(API_KEY_CONTEXT_KEY)
  config.headers[ACCESS_TOKEN_REQUEST_HEADER_KEY] = webHttpContext.get(ACCESS_TOKEN_CONTEXT_KEY)
  config.headers[ENCRYPTION_KEY_REQUEST_HEADER_KEY] = encryptedEncryptionKey
  config.headers[CLIENT_ID_REQUEST_HEADER_KEY] = webHttpContext.get(CLIENT_ID_CONTEXT_KEY)
  config.headers[APP_UID_REQUEST_HEADER_KEY] = webHttpContext.get(APP_UID_CONTEXT_KEY)
}

function responseSuccess (response) {
  const { headers, config } = response
  const { webHttpContext } = config
  _extractResponseHeaders(webHttpContext, headers)
  return response
}

function responseError (error) {
  const { response, config } = error
  if (response) {
    const { headers } = response
    const { webHttpContext } = config
    _extractResponseHeaders(webHttpContext, headers)
  }
  throw error
}

function _extractResponseHeaders (webHttpContext, headers = {}) {
  const sessionId = headers[SESSION_ID_RESPONSE_HEADER_KEY]
  if (sessionId) { webHttpContext.set(SESSION_ID_CONTEXT_KEY, sessionId) }

  const accessToken = headers[ACCESS_TOKEN_RESPONSE_HEADER_KEY]
  if (accessToken) { webHttpContext.set(ACCESS_TOKEN_CONTEXT_KEY, accessToken) }

  const appUid = headers[APP_UID_RESPONSE_HEADER_KEY]
  if (appUid) { webHttpContext.set(APP_UID_CONTEXT_KEY, appUid) }
}
