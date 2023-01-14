import { v4 } from 'uuid'
import HEADERS from '../CONSTANTS/HEADERS.mjs'
import CONTEXT from '../CONSTANTS/CONTEXT.mjs'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess (config) {
  const {
    webHttpContext,
    webHttpConfig: {
      encryptedEncryptionKey = ''
    } = {}
  } = config

  config.headers[HEADERS.REQ.SESSION_ID] = webHttpContext.get(CONTEXT.SESSION_ID)
  config.headers[HEADERS.REQ.REQUEST_ID] = v4().replaceAll('-', '')
  config.headers[HEADERS.REQ.API_KEY] = webHttpContext.get(CONTEXT.API_KEY)
  config.headers[HEADERS.REQ.ACCESS_TOKEN] = webHttpContext.get(CONTEXT.ACCESS_TOKEN)
  config.headers[HEADERS.REQ.ENCRYPTION_KEY] = encryptedEncryptionKey
  config.headers[HEADERS.REQ.CLIENT_ID] = webHttpContext.get(CONTEXT.CLIENT_ID)
  return config
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
  const accessToken = headers[HEADERS.RES.ACCESS_TOKEN]
  if (accessToken) { webHttpContext.set(CONTEXT.ACCESS_TOKEN, accessToken) }

  const refreshToken = headers[HEADERS.RES.ACCESS_TOKEN]
  if (refreshToken) { webHttpContext.set(CONTEXT.REFRESH_TOKEN, refreshToken) }
}
