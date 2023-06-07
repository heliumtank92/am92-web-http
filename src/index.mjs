import axios from 'axios'
import axiosRetry from 'axios-retry'
import { nanoid } from 'nanoid'

import CONTEXT from './CONSTANTS/CONTEXT.mjs'
import HEADERS from './CONSTANTS/HEADERS.mjs'
import CryptoInterceptor from './lib/CryptoInterceptor.mjs'
import HeaderInterceptor from './lib/HeaderInterceptor.mjs'
import WebHttpError from './WebHttpError.mjs'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

const DEFAULT_WEB_HTTP_CONFIG = {
  disableCrypto: false,
  disableHeaderInjection: false
}

export { CONTEXT, HEADERS }
export default class WebHttp {
  constructor(CONFIG = {}, webHttpConfig = DEFAULT_WEB_HTTP_CONFIG) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }
    this.webHttpConfig = { ...DEFAULT_WEB_HTTP_CONFIG, ...webHttpConfig }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // WebHttp Context for all request at session level
    this.context = new Map([
      [CONTEXT.SESSION_ID, nanoid()],
      [CONTEXT.API_KEY, ''],
      [CONTEXT.ACCESS_TOKEN, ''],
      [CONTEXT.REFRESH_TOKEN, ''],
      [CONTEXT.PUBLIC_KEY, ''],
      [CONTEXT.CLIENT_ID, 'BROWSER'],
      [(CONTEXT.AUTHENTICATION_TOKEN_KEY, HEADERS.REQ.ACCESS_TOKEN)]
    ])

    this.interceptors = this.client.interceptors

    // Use Default Interceptors
    this._useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request(options = {}) {
    try {
      const { webHttpConfig = {} } = options
      options.webHttpContext = this.context
      options.webHttpConfig = { ...this.webHttpConfig, ...webHttpConfig }

      const response = await this.client.request(options)
      return response
    } catch (e) {
      const { request, response } = e
      // Handle Axios Response Error
      if (response) {
        const { status, statusText, data: body } = response
        const { statusCode, message, error = {}, errorCode } = body
        const { publicKey } = error

        if (errorCode === 'ApiCrypto::PRIVATE_KEY_NOT_FOUND') {
          this.context.set(CONTEXT.PUBLIC_KEY, publicKey)
          return await this.request(options)
        }

        const eMap = {
          statusCode: statusCode || status,
          message: message || statusText,
          errorCode
        }
        throw new WebHttpError(body, eMap)
      }

      // Handle Axios Request Error
      if (request) {
        const errorParams = {
          statusCode: -1,
          errorCode: 'WebHttp::NETWORK'
        }
        throw new WebHttpError(e, errorParams)
      }

      // Handle any other form of error
      const errorParams = {
        statusCode: -2,
        errorCode: 'WebHttp::UNKWON'
      }
      throw new WebHttpError(e, errorParams)
    }
  }

  _useDefaultInterceptors = () => {
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
