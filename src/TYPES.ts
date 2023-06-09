import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
  Method
} from 'axios'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'

export type WebHttpContextKeys =
  | 'SESSION_ID'
  | 'API_KEY'
  | 'ACCESS_TOKEN'
  | 'REFRESH_TOKEN'
  | 'PUBLIC_KEY'
  | 'CLIENT_ID'
  | 'AUTHENTICATION_TOKEN_KEY'

export type WebHttpContextMap = {
  [key in WebHttpContextKeys]: WebHttpContextKeys
}

export type WebHttpContext = Map<WebHttpContextKeys, string>

export interface WebHttpAxiosConfig
  extends CreateAxiosDefaults,
    IAxiosRetryConfig {}

export const DefaultWebHttpAxiosConfig = {
  retryDelay: axiosRetry.exponentialDelay
}

export type WebHttpConfig = {
  disableCrypto?: boolean
  disableHeaderInjection?: boolean
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
    AxiosRequestConfig,
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
