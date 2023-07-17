import { WebHttpErrorMap } from '../TYPES'

export const DEFAULT_REQUEST_ERROR: WebHttpErrorMap = {
  statusCode: -1,
  errorCode: 'WebHttp::NETWORK'
}

export const MISSING_PUBLIC_KEY_ERROR: WebHttpErrorMap = {
  statusCode: -1,
  message: 'API Encryption Failed! Missing Public Key',
  errorCode: 'WebHttp::MISSING_PUBLIC_KEY'
}
