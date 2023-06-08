import HEADERS from '../CONSTANTS/HEADERS'
import CONTEXT from '../CONSTANTS/CONTEXT'
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess(config: AxiosRequestConfig) {
  const axiosRetry = config['axios-retry']
  if (axiosRetry) {
    return config
  }

  const {
    webHttpContext,
    webHttpConfig: { disableHeaderInjection, encryptedEncryptionKey = '' } = {}
  } = config

  if (disableHeaderInjection) {
    return config
  }

  config.headers = config.headers || {}

  _appendHeaderFormContext(
    config,
    webHttpContext,
    HEADERS.REQ.SESSION_ID,
    CONTEXT.SESSION_ID
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    HEADERS.REQ.API_KEY,
    CONTEXT.API_KEY
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    webHttpContext.get(CONTEXT.AUTHENTICATION_TOKEN_KEY),
    CONTEXT.ACCESS_TOKEN
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    HEADERS.REQ.CLIENT_ID,
    CONTEXT.CLIENT_ID
  )

  config.headers[HEADERS.REQ.REQUEST_ID] = window.crypto.randomUUID()

  if (encryptedEncryptionKey) {
    config.headers[HEADERS.REQ.ENCRYPTION_KEY] = encryptedEncryptionKey
  }

  return config
}

function responseSuccess(response: AxiosResponse) {
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

function responseError(error: AxiosError) {
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
  } else {
    const authToken = headers[HEADERS.RES.AUTH_TOKEN]
    if (authToken) {
      webHttpContext.set(CONTEXT.ACCESS_TOKEN, authToken)
      webHttpContext.set(
        CONTEXT.AUTHENTICATION_TOKEN_KEY,
        HEADERS.REQ.AUTH_TOKEN
      )
    }
  }

  const refreshToken = headers[HEADERS.RES.ACCESS_TOKEN]
  if (refreshToken) {
    webHttpContext.set(CONTEXT.REFRESH_TOKEN, refreshToken)
  }
}

function _appendHeaderFormContext(
  config,
  webHttpContext,
  headerKey,
  contextkey
) {
  const headerValue = webHttpContext.get(contextkey)

  if (headerValue) {
    config.headers[headerKey] = headerValue
  }
}
