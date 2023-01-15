import axios from 'axios'
import axiosRetry from 'axios-retry'
import { v4 } from 'uuid'

import CONTEXT from './CONSTANTS/CONTEXT.mjs'
import CryptoInterceptor from './lib/CryptoInterceptor.mjs'
import HeaderInterceptor from './lib/HeaderInterceptor.mjs'
import WebHttpError from './WebHttpError.mjs'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

export default class WebHttp {
  constructor (CONFIG = {}, webHttpConfig = {}) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }
    this.webHttpConfig = webHttpConfig

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // WebHttp Context for all request at session level
    this.context = new Map([
      [CONTEXT.SESSION_ID, v4().replaceAll('-', '')],
      [CONTEXT.API_KEY, ''],
      [CONTEXT.ACCESS_TOKEN, ''],
      [CONTEXT.REFRESH_TOKEN, ''],
      [CONTEXT.PUBLIC_KEY, ''],
      [CONTEXT.CLIENT_ID, 'BROWSER']
    ])

    this.interceptors = this.client.interceptors

    // Use Default Interceptors
    this.#useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request (options = {}) {
    try {
      const { webHttpConfig = {} } = options
      options.webHttpContext = this.context
      options.webHttpConfig = { ...this.webHttpConfig, ...webHttpConfig }

      const response = await this.client.request(options)
      return response
    } catch (error) {
      const { request, response } = error
      // Handle Axios Response Error
      if (response) {
        const { status, data: body } = response
        const {
          statusCode = 500,
          message = 'Internal Server Error',
          error: err = {}
        } = body
        const { errorCode, publicKey } = err

        if (errorCode === 'API_CRYPTO::PRIVATE_KEY_NOT_FOUND') {
          this.context.set(CONTEXT.PUBLIC_KEY, publicKey)
          return await this.request(options)
        }

        const eMap = {
          statusCode: (statusCode || status),
          message,
          errorCode
        }
        throw new WebHttpError(body, eMap)
      }

      // Handle Axios Request Error
      if (request) {
        const { message } = error
        const errorParams = {
          statusCode: -1,
          message,
          errorCode: 'WEN_HTTP::NETWORK'
        }
        throw new WebHttpError(error, errorParams)
      }

      // Handle any other form of error
      const errorParams = {
        statusCode: -2,
        errorCode: 'WEN_HTTP::UNKWON'
      }
      throw new WebHttpError(error, errorParams)
    }
  }

  #useDefaultInterceptors () {
    this.interceptors.request.use(...HeaderInterceptor.request)
    this.interceptors.response.use(...HeaderInterceptor.response)

    this.interceptors.request.use(...CryptoInterceptor.request)
    this.interceptors.response.use(...CryptoInterceptor.response)
  }
}
