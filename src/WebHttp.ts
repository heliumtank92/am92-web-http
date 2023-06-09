import axios from 'axios'
import axiosRetry from 'axios-retry'

import CryptoInterceptor from './lib/CryptoInterceptor'
import HeaderInterceptor from './lib/HeaderInterceptor'
import WebHttpError from './WebHttpError'

import {
  DefaultWebHttpAxiosConfig,
  DefaultWebHttpConfig,
  WebHttpContext,
  WebHttpAxiosConfig,
  WebHttpAxiosError,
  WebHttpConfig,
  WebHttpRequestOptions,
  WebHttpResponse
} from './TYPES'
import { ErrorMap } from './INTERNAL_TYPES'
import { WEB_HTTP_CONTEXT, WEB_HTTP_HEADERS } from './CONSTANTS'

export default class WebHttp {
  webHttpConfig: WebHttpConfig
  context: WebHttpContext
  client
  interceptors

  constructor(
    webHttpAxiosConfig?: WebHttpAxiosConfig,
    webHttpConfig?: WebHttpConfig
  ) {
    // Configurations
    const config = { ...DefaultWebHttpAxiosConfig, ...webHttpAxiosConfig }
    this.webHttpConfig = { ...DefaultWebHttpConfig, ...webHttpConfig }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // WebHttp Context for all request at session level
    this.context = new Map([
      [WEB_HTTP_CONTEXT.SESSION_ID, window.crypto.randomUUID()],
      [WEB_HTTP_CONTEXT.API_KEY, ''],
      [WEB_HTTP_CONTEXT.ACCESS_TOKEN, ''],
      [WEB_HTTP_CONTEXT.REFRESH_TOKEN, ''],
      [WEB_HTTP_CONTEXT.PUBLIC_KEY, ''],
      [WEB_HTTP_CONTEXT.CLIENT_ID, 'BROWSER'],
      [
        WEB_HTTP_CONTEXT.AUTHENTICATION_TOKEN_KEY,
        WEB_HTTP_HEADERS.REQ.ACCESS_TOKEN
      ]
    ])

    this.interceptors = this.client.interceptors

    // Use Default Interceptors
    this._useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request(options: WebHttpRequestOptions): Promise<WebHttpResponse> {
    const { webHttpConfig = {} } = options
    options.webHttpContext = this.context
    options.webHttpConfig = {
      ...this.webHttpConfig,
      ...webHttpConfig
    }

    const response: WebHttpResponse = await this.client
      .request(options)
      .catch(async (e: WebHttpAxiosError) => {
        const { request, response } = e
        // Handle Axios Response Error
        if (response) {
          const { status, statusText } = response
          const body: any = response.data as any
          const { statusCode, message, error, errorCode } = body || {}

          const { publicKey } = error

          if (errorCode === 'ApiCrypto::PRIVATE_KEY_NOT_FOUND') {
            this.context.set(WEB_HTTP_CONTEXT.PUBLIC_KEY, publicKey)
            return await this.request(options)
          }

          const eMap: ErrorMap = {
            statusCode: statusCode || status,
            message: message || statusText,
            errorCode
          }
          throw new WebHttpError(body, eMap)
        }

        // Handle Axios Request Error
        if (request) {
          const eMap: ErrorMap = {
            statusCode: -1,
            errorCode: 'WebHttp::NETWORK'
          }
          throw new WebHttpError(e, eMap)
        }

        // Handle any other form of error
        const eMap: ErrorMap = {
          statusCode: -2,
          errorCode: 'WebHttp::UNKWON'
        }
        throw new WebHttpError(e, eMap)
      })
    return response
  }

  _useDefaultInterceptors() {
    const { disableCrypto, disableHeaderInjection } = this.webHttpConfig

    if (!disableHeaderInjection) {
      this.interceptors.request.use(...HeaderInterceptor.request)
      this.interceptors.response.use(...HeaderInterceptor.response)
    }

    if (!disableCrypto) {
      this.interceptors.request.use(...CryptoInterceptor.request)
      this.interceptors.response.use(...CryptoInterceptor.response)
    }
  }
}
