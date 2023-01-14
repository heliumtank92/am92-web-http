import axios from 'axios'
import axiosRetry from 'axios-retry'
import CONTEXT from './CONSTANTS/CONTEXT.mjs'
import CryptoInterceptor from './lib/CryptoInterceptor.mjs'
import HeaderInterceptor from './lib/HeaderInterceptor.mjs'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

export default class WebHttp {
  constructor (CONFIG = {}) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // WebHttp Context for all request at session level
    this.context = new Map([
      [CONTEXT.SESSION_ID, ''],
      [CONTEXT.API_KEY, ''],
      [CONTEXT.ACCESS_TOKEN, ''],
      [CONTEXT.REFRESH_TOKEN, ''],
      [CONTEXT.PUBLIC_KEY, ''],
      [CONTEXT.CLIENT_ID, 'BROWSER']
    ])

    this.interceptors = {
      request: {
        use: this.client.interceptors.request.use.bind(this.client),
        eject: this.client.interceptors.request.eject.bind(this.client)
      },
      response: {
        use: this.client.interceptors.response.use.bind(this.client),
        eject: this.client.interceptors.response.eject.bind(this.client)
      }
    }

    // Use Default Interceptors
    this.#useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request (options = {}) {
    try {
      options.webHttpContext = this.context
      options.webHttpConfig = {}
      const response = await this.client.request(options)
      return response
    } catch (error) { }
  }

  #useDefaultInterceptors () {
    this.interceptors.request.use(...CryptoInterceptor.request)
    this.interceptors.response.use(...CryptoInterceptor.response)

    this.interceptors.request.use(...HeaderInterceptor.request)
    this.interceptors.response.use(...HeaderInterceptor.response)
  }
}
