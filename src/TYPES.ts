import {
  AxiosError,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
  Method
} from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { WEB_HTTP_CONTEXT } from './CONSTANTS'

export { AxiosError }

/**
 * Interface for WebHttpContext Map.
 *
 * @typedef {WebHttpContext}
 */
export type WebHttpContext = Map<keyof typeof WEB_HTTP_CONTEXT, string>

/**
 * Interface for axios and axios-retry config to be taken to instantiate WebHttp.
 *
 * @interface
 * @typedef {WebHttpAxiosConfig}
 * @extends {CreateAxiosDefaults}
 * @extends {IAxiosRetryConfig}
 */
export interface WebHttpAxiosConfig
  extends CreateAxiosDefaults,
    IAxiosRetryConfig {}

/**
 * Default WebHttpAxiosConfig for WebHttp instance.
 */
export const DefaultWebHttpAxiosConfig: WebHttpAxiosConfig = {
  retryDelay: axiosRetry.exponentialDelay,
  retries: 0
}

/**
 * Type defination for WebHttpConfig.
 *
 * @typedef {WebHttpConfig}
 */
export type WebHttpConfig = {
  disableCrypto?: boolean
  disableHeaderInjection?: boolean
  encryptedEncryptionKey?: string
  encryptionKey?: CryptoKey
}

/**
 * Default WebHttpConfig for WebHttp instance.
 */
export const DefaultWebHttpConfig: WebHttpConfig = {
  disableCrypto: false,
  disableHeaderInjection: false
}

/**
 * Interface for axios's InternalAxiosRequestConfig.
 *
 * @interface
 * @typedef {WebHttpRequestConfig}
 * @extends {InternalAxiosRequestConfig}
 */
export interface WebHttpRequestConfig extends InternalAxiosRequestConfig {}

/**
 * Interface for request function options parameter.
 *
 * @interface
 * @typedef {WebHttpRequestOptions}
 * @extends {Omit<AxiosRequestConfig, 'url' | 'method' | 'webHttpConfig' | 'webHttpContext'>}
 */
export interface WebHttpRequestOptions
  extends Omit<
    AxiosRequestConfig,
    'url' | 'method' | 'webHttpConfig' | 'webHttpContext'
  > {
  /**
   * URL string on which API request is to be made.
   */
  url: string
  /**
   * HTTP Method to be used which making the API request.
   */
  method: Method | string
  /**
   * WebHttpConfig to be used exclusively for the given API request.
   */
  webHttpConfig?: WebHttpConfig
}

/**
 * Interface for axios's AxiosResponse.
 *
 * @interface
 * @typedef {WebHttpResponse}
 * @extends {Omit<AxiosResponse, 'config'>}
 */
export interface WebHttpResponse extends Omit<AxiosResponse, 'config'> {
  /**
   * Overriding 'config' property of AxiosResponse
   */
  config: WebHttpRequestConfig
}

/**
 * Interface for axios's AxiosError.
 *
 * @interface
 * @typedef {WebHttpAxiosError}
 * @extends {Omit<AxiosError, 'config' | 'response'>}
 */
export interface WebHttpAxiosError
  extends Omit<AxiosError, 'config' | 'response'> {
  /**
   * Overriding 'config' property of AxiosError
   */
  config: WebHttpRequestConfig
  /**
   * Overriding 'response' property of AxiosError
   */
  response: WebHttpResponse
}

/**
 * Type defination for error map to be passed to WebHttpError.
 *
 * @typedef {WebHttpErrorMap}
 */
export type WebHttpErrorMap = {
  statusCode?: number
  message?: string
  errorCode?: string
}

/**
 * Interface for WebHttp interceptors
 *
 * @interface
 * @typedef {WebHttpInterceptors}
 */
export interface WebHttpInterceptors {
  /**
   * Request interceptor manager
   */
  request: AxiosInterceptorManager<WebHttpRequestConfig>
  /**
   * Response interceptor manager
   */
  response: AxiosInterceptorManager<WebHttpResponse>
}

/** @internal */
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    webHttpConfig: WebHttpConfig
    webHttpContext: WebHttpContext
  }
}
