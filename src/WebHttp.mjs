import axios from 'axios'
import axiosRetry from 'axios-retry'
import { v4 } from 'uuid'

import CONTEXT from './CONSTANTS/CONTEXT.mjs'
import CryptoInterceptor from './lib/CryptoInterceptor.mjs'
import HeaderInterceptor from './lib/HeaderInterceptor.mjs'

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

      console.log('options.webHttpConfig', options.webHttpConfig)
      const response = await this.client.request(options)
      return response
    } catch (error) {
      console.log('error', error)
    }
  }

  #useDefaultInterceptors () {
    this.interceptors.request.use(...HeaderInterceptor.request)
    this.interceptors.response.use(...HeaderInterceptor.response)

    this.interceptors.request.use(...CryptoInterceptor.request)
    this.interceptors.response.use(...CryptoInterceptor.response)
  }
}
