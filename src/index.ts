import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
import axiosRetry from 'axios-retry'

import CONTEXT from './CONSTANTS/CONTEXT'
import HEADERS from './CONSTANTS/HEADERS'
// import CryptoInterceptor from './lib/CryptoInterceptor'
// import HeaderInterceptor from './lib/HeaderInterceptor'
import WebHttpError from './WebHttpError'
import {
  Config,
  Context,
  DefaultWebHttpConfig,
  ErrorMap,
  WebHttpConfig
} from './Types'

const DEFAULT_CONFIG = {
  retryDelay: axiosRetry.exponentialDelay
}

const DEFAULT_WEB_HTTP_CONFIG = {
  disableCrypto: false,
  disableHeaderInjection: false
}

export { CONTEXT, HEADERS }
export default class WebHttp {
  webHttpConfig = DefaultWebHttpConfig
  client: AxiosInstance
  context: Context

  constructor(CONFIG: Config, webHttpConfig: WebHttpConfig) {
    // Configurations
    const config = { ...DEFAULT_CONFIG, ...CONFIG }
    this.webHttpConfig = { ...DefaultWebHttpConfig, ...webHttpConfig }

    // Create Axios Instance & Attach Axios Retry
    this.client = axios.create(config)
    axiosRetry(this.client, config)

    // WebHttp Context for all request at session level
    this.context = new Map([
      [CONTEXT.SESSION_ID, window.crypto.randomUUID()],
      [CONTEXT.API_KEY, ''],
      [CONTEXT.ACCESS_TOKEN, ''],
      [CONTEXT.REFRESH_TOKEN, ''],
      [CONTEXT.PUBLIC_KEY, ''],
      [CONTEXT.CLIENT_ID, 'BROWSER'],
      [CONTEXT.AUTHENTICATION_TOKEN_KEY, HEADERS.REQ.ACCESS_TOKEN]
    ])

    // this.interceptors = this.client.interceptors

    // // Use Default Interceptors
    // this._useDefaultInterceptors()

    // Bind Functions
    // this.request = this.request.bind(this)
  }

  request = async (options: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { webHttpConfig = {} } = options
    options.webHttpContext = this.context
    options.webHttpConfig = {
      ...this.webHttpConfig,
      ...webHttpConfig
    }

    return await this.client.request(options).catch(async (e: AxiosError) => {
      const { request, response } = e
      // Handle Axios Response Error
      if (response) {
        const { status, statusText } = response
        const body: any = response.data as any
        const { statusCode, message, error, errorCode } = body || {}

        const { publicKey } = error

        if (errorCode === 'ApiCrypto::PRIVATE_KEY_NOT_FOUND') {
          this.context.set(CONTEXT.PUBLIC_KEY, publicKey)
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
  }

  // _useDefaultInterceptors = () => {
  //   const { disableCrypto, disableHeaderInjection } = this.webHttpConfig

  //   if (!disableHeaderInjection) {
  //     this.interceptors.request.use(...HeaderInterceptor.request)
  //     this.interceptors.response.use(...HeaderInterceptor.response)
  //   }

  //   if (!disableCrypto) {
  //     this.interceptors.request.use(...CryptoInterceptor.request)
  //     this.interceptors.response.use(...CryptoInterceptor.response)
  //   }
  // }
}
