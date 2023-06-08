import {
  AxiosError,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
  Method
} from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { WEB_HTTP_CONTEXT } from './CONSTANTS'

export type WebHttpContext = Map<keyof typeof WEB_HTTP_CONTEXT, string>

export interface WebHttpAxiosConfig
  extends CreateAxiosDefaults,
    IAxiosRetryConfig {}

export const DefaultWebHttpAxiosConfig = {
  retryDelay: axiosRetry.exponentialDelay
}

export type WebHttpConfig = {
  disableCrypto: boolean
  disableHeaderInjection: boolean
  encryptedEncryptionKey?: string
  encryptionKey?: CryptoKey
}

export const DefaultWebHttpConfig = {
  disableCrypto: false,
  disableHeaderInjection: false
}

export interface WebHttpRequestConfig extends InternalAxiosRequestConfig {}

export interface WebHttpRequestOptions
  extends Omit<
    InternalAxiosRequestConfig,
    'url' | 'method' | 'webHttpConfig' | 'webHttpContext'
  > {
  url: string
  method: Method | string
  webHttpConfig?: WebHttpConfig
  webHttpContext?: WebHttpContext
}

export interface WebHttpResponse extends Omit<AxiosResponse, 'config'> {
  config: WebHttpRequestConfig
}

export interface WebHttpAxiosError
  extends Omit<AxiosError, 'config' | 'response'> {
  config: WebHttpRequestConfig
  response: WebHttpResponse
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    webHttpConfig: WebHttpConfig
    webHttpContext: WebHttpContext
  }
}
