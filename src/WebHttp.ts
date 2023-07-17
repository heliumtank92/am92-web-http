import axios, { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { randomId } from '@am92/utils-string'

import CryptoInterceptor from './lib/CryptoInterceptor'
import HeaderInterceptor from './lib/HeaderInterceptor'
import { WebHttpError } from './WebHttpError'

import {
  DefaultWebHttpAxiosConfig,
  DefaultWebHttpConfig,
  WebHttpContext,
  WebHttpAxiosConfig,
  WebHttpAxiosError,
  WebHttpConfig,
  WebHttpRequestOptions,
  WebHttpResponse,
  WebHttpInterceptors,
  WebHttpErrorMap
} from './TYPES'

import { WEB_HTTP_CONTEXT, WEB_HTTP_REQ_HEADERS } from './CONSTANTS'
import { DEFAULT_REQUEST_ERROR } from './CONSTANTS/ERRORS'

/**
 * HTTP Client Class.
 *
 * @class
 * @typedef {WebHttp}
 */
export default class WebHttp {
  /**
   * webHttpConfig initialized at WebHttp instance level for all API requests.
   */
  webHttpConfig: WebHttpConfig
  /**
   * WebHttpContext instance associated with WebHttp instance.
   */
  context: WebHttpContext
  /**
   * Axios client associated with WebHttp instance.
   */
  client: AxiosInstance
  /**
   * Axios interceptors attached to WebHttp instance for easier use.
   */
  interceptors: WebHttpInterceptors

  /**
   * Creates an instance of WebHttp.
   *
   * @constructor
   * @param [webHttpAxiosConfig] axios and axios-retry config to be associated with the axios client. Defaults to {@link DefaultWebHttpConfig}
   * @param [webHttpConfig] webHttpConfig to be initialized at WebHttp instance level for all API requests. Defaults to {@link DefaultWebHttpConfig}
   */
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
      [WEB_HTTP_CONTEXT.SESSION_ID, randomId(20)],
      [WEB_HTTP_CONTEXT.API_KEY, ''],
      [WEB_HTTP_CONTEXT.ACCESS_TOKEN, ''],
      [WEB_HTTP_CONTEXT.REFRESH_TOKEN, ''],
      [WEB_HTTP_CONTEXT.PUBLIC_KEY, ''],
      [WEB_HTTP_CONTEXT.CLIENT_ID, 'BROWSER'],
      [
        WEB_HTTP_CONTEXT.AUTHENTICATION_TOKEN_KEY,
        WEB_HTTP_REQ_HEADERS.ACCESS_TOKEN
      ]
    ])

    this.interceptors = this.client.interceptors

    // Use Default Interceptors
    this._useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  /**
   * Method to make API call.
   *
   * @async
   * @param options Axios request options to define the API call.
   * @throws {WebHttpError}
   * @returns
   */
  async request(options: WebHttpRequestOptions): Promise<WebHttpResponse> {
    const { webHttpConfig = {}, ...restOptions } = options
    const requestOptions = {
      ...restOptions,
      webHttpContext: this.context,
      webHttpConfig: {
        ...this.webHttpConfig,
        ...webHttpConfig
      }
    }

    const response: WebHttpResponse = await this.client
      .request(requestOptions)
      .catch(async (e: WebHttpAxiosError) => {
        const { request, response } = e
        // Handle Axios Response Error
        if (response) {
          const { status, statusText } = response
          const body: any = response.data as any
          const { statusCode, message, error, errorCode } = body || {}

          if (errorCode === 'ApiCrypto::PRIVATE_KEY_NOT_FOUND') {
            const { publicKey = '' } = error || {}
            this.context.set(WEB_HTTP_CONTEXT.PUBLIC_KEY, publicKey)
            return await this.request(options)
          }

          const eMap: WebHttpErrorMap = {
            statusCode: statusCode || status,
            message: message || statusText,
            errorCode
          }
          throw new WebHttpError(body, eMap)
        }

        // Handle Axios Request Error
        if (request) {
          throw new WebHttpError(e, DEFAULT_REQUEST_ERROR)
        }

        // Handle any other form of error
        throw new WebHttpError(e)
      })
    return response
  }

  /** @ignore */
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
