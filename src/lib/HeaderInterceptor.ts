import { RawAxiosResponseHeaders } from 'axios'

import { WebHttpContext, WebHttpRequestConfig, WebHttpResponse } from '../TYPES'
import { WEB_HTTP_CONTEXT, WEB_HTTP_HEADERS } from '../CONSTANTS'

const HeaderInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess, responseError]
}

export default HeaderInterceptor

function requestSuccess(config: WebHttpRequestConfig): WebHttpRequestConfig {
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
    WEB_HTTP_HEADERS.REQ.SESSION_ID,
    WEB_HTTP_CONTEXT.SESSION_ID
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    WEB_HTTP_HEADERS.REQ.API_KEY,
    WEB_HTTP_CONTEXT.API_KEY
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    webHttpContext.get(WEB_HTTP_CONTEXT.AUTHENTICATION_TOKEN_KEY) as string,
    WEB_HTTP_CONTEXT.ACCESS_TOKEN
  )
  _appendHeaderFormContext(
    config,
    webHttpContext,
    WEB_HTTP_HEADERS.REQ.CLIENT_ID,
    WEB_HTTP_CONTEXT.CLIENT_ID
  )

  config.headers[WEB_HTTP_HEADERS.REQ.REQUEST_ID] = window.crypto.randomUUID()

  if (encryptedEncryptionKey) {
    config.headers[WEB_HTTP_HEADERS.REQ.ENCRYPTION_KEY] = encryptedEncryptionKey
  }

  return config
}

function responseSuccess(response: WebHttpResponse): WebHttpResponse {
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

function responseError(response: WebHttpResponse) {
  const { headers, config } = response

  const {
    webHttpContext,
    webHttpConfig: { disableHeaderInjection }
  } = config

  if (!disableHeaderInjection) {
    _extractResponseHeaders(webHttpContext, headers)
  }

  return response
}

function _extractResponseHeaders(
  webHttpContext: WebHttpContext,
  headers: RawAxiosResponseHeaders
) {
  const accessToken = headers[WEB_HTTP_HEADERS.RES.ACCESS_TOKEN] as string
  if (accessToken) {
    webHttpContext.set(WEB_HTTP_CONTEXT.ACCESS_TOKEN, accessToken)
  } else {
    const authToken = headers[WEB_HTTP_HEADERS.RES.AUTH_TOKEN] as string
    if (authToken) {
      webHttpContext.set(WEB_HTTP_CONTEXT.ACCESS_TOKEN, authToken)
      webHttpContext.set(
        WEB_HTTP_CONTEXT.AUTHENTICATION_TOKEN_KEY,
        WEB_HTTP_HEADERS.REQ.AUTH_TOKEN
      )
    }
  }

  const refreshToken = headers[WEB_HTTP_HEADERS.RES.ACCESS_TOKEN] as string
  if (refreshToken) {
    webHttpContext.set(WEB_HTTP_CONTEXT.REFRESH_TOKEN, refreshToken)
  }
}

function _appendHeaderFormContext(
  config: WebHttpRequestConfig,
  webHttpContext: WebHttpContext,
  headerKey: string,
  contextkey: keyof typeof WEB_HTTP_CONTEXT
) {
  const headerValue = webHttpContext.get(contextkey)

  if (headerValue) {
    config.headers[headerKey] = headerValue
  }
}