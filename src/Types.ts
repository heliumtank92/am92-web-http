import { AxiosRequestConfig, CreateAxiosDefaults } from 'axios'
import { IAxiosRetryConfig } from 'axios-retry'

export type Context = Map<string, string>

export interface Config extends CreateAxiosDefaults, IAxiosRetryConfig {}
export type WebHttpConfig = {
  disableCrypto: boolean
  disableHeaderInjection: boolean
  encryptedEncryptionKey?: string
}

export const DefaultWebHttpConfig = {
  disableCrypto: false,
  disableHeaderInjection: false
}

export type ErrorMap = {
  statusCode?: number
  message?: string
  errorCode?: string
}

declare module 'axios' {
  interface AxiosRequestConfig {
    webHttpConfig: WebHttpConfig
    webHttpContext: Context
  }
}
