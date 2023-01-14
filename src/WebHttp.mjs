import axios from 'axios'
import axiosRetry from 'axios-retry'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

// In WebHttp Scope:
// - ApiKey
// - PublicKey
// - AuthToken
// - RefreshToken
// - SessionId
// - ClientId

// In Request Scope:
// - Request Id
// - Encryption Keys

export default class WebHttp {
  constructor (CONFIG = {}) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // this.interceptors = {
    //   request: { use: this.client.interceptors.request.use },
    //   response: { use: this.client.interceptors.response.use }
    // }

    // Use Request & Response Interceptors to Axios Client
    this.useRequestInterceptor = this.useRequestInterceptor.bind(this)
    this.useResponseInterceptor = this.useResponseInterceptor.bind(this)

    // Eject Request & Response Interceptors to Axios Client
    this.ejectRequestInterceptor = this.ejectRequestInterceptor.bind(this)
    this.ejectResponseInterceptor = this.ejectResponseInterceptor.bind(this)

    // Use Default Interceptors
    this.#useDefaultInterceptors()

    // Bind Functions
    this.request = this.request.bind(this)
  }

  async request (options = {}) {
    try {
      const response = await this.client.request(options)
      return response
    } catch (error) { }
  }

  #useDefaultInterceptors () { }

  useRequestInterceptor (interceptor = []) {
    if (interceptor.length) {
      return this.client.interceptors.request.use(...interceptor)
    }
  }

  useResponseInterceptor (interceptor = []) {
    if (interceptor.length) {
      return this.client.interceptors.response.use(...interceptor)
    }
  }

  ejectRequestInterceptor (index) {
    this.client.interceptors.request.eject(index)
  }

  ejectResponseInterceptor (index) {
    this.client.interceptors.response.eject(index)
  }
}
