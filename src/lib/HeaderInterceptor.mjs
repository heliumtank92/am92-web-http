import { v4 } from 'uuid'
import HEADERS from '../CONSTANTS/HEADERS.mjs'
import CONTEXT from '../CONSTANTS/CONTEXT.mjs'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess(config) {
  const axiosRetry = config['axios-retry']
  if (axiosRetry) {
    return config
  }

  const {
    webHttpContext,
    webHttpConfig: {
      disableHeaderInjection,
      encryptedEncryptionKey = ''
    } = {}
  } = config

  if (disableHeaderInjection) {
    return config
  }

  _appendHeaderFormContext(
    webHttpContext,
    HEADERS.REQ.SESSION_ID,
    CONTEXT.SESSION_ID
  )
  _appendHeaderFormContext(
    webHttpContext,
    HEADERS.REQ.API_KEY,
    CONTEXT.API_KEY
  )
  _appendHeaderFormContext(
    webHttpContext,
    HEADERS.REQ.ACCESS_TOKEN,
    CONTEXT.ACCESS_TOKEN
  )
  _appendHeaderFormContext(
    webHttpContext,
    HEADERS.REQ.CLIENT_ID,
    CONTEXT.CLIENT_ID
  )

  config.headers[HEADERS.REQ.REQUEST_ID] = v4().replaceAll('-', '')

  if (encryptedEncryptionKey) {
    config.headers[HEADERS.REQ.ENCRYPTION_KEY] =
      encryptedEncryptionKey
  }

  return config
}

function responseSuccess(response) {
  const { headers, config } = response
  const {
    webHttpContext,
    webHttpConfig: { disableHeaderInjection }
  } = config

  if (disableHeaderInjection) {
    return response
  }

  _extractResponseHeaders(webHttpContext, headers)
  return response
}

function responseError(error) {
  const { response, config } = error

  if (response) {
    const { headers } = response
    const {
      webHttpContext,
      webHttpConfig: { disableHeaderInjection }
    } = config

    if (!disableHeaderInjection) {
      _extractResponseHeaders(webHttpContext, headers)
    }
  }

  throw error
}

function _extractResponseHeaders(webHttpContext, headers = {}) {
  const accessToken = headers[HEADERS.RES.ACCESS_TOKEN]
  if (accessToken) {
    webHttpContext.set(CONTEXT.ACCESS_TOKEN, accessToken)
  }

  const refreshToken = headers[HEADERS.RES.ACCESS_TOKEN]
  if (refreshToken) {
    webHttpContext.set(CONTEXT.REFRESH_TOKEN, refreshToken)
  }
}

function _appendHeaderFormContext(
  webHttpContext,
  headerKey,
  contextkey
) {
  const headerValue = webHttpContext.get(contextkey)

  if (headerValue) {
    config.headers[headerKey] = headerValue
  }
}
