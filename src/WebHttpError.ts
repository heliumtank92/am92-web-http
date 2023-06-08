import { AxiosError } from 'axios'
import { ErrorMap } from './Types'

const DEFAULT_ERROR_MSG = 'Web Http Error'
const DEFAULT_ERROR_STATUS_CODE = 500
const DEFAULT_ERROR_CODE = 'WEB_HTTP_ERROR'

export default class WebHttpError extends Error {
  _isCustomError = true
  _isWebHttpError = true
  message = DEFAULT_ERROR_MSG
  statusCode = DEFAULT_ERROR_STATUS_CODE
  errorCode = DEFAULT_ERROR_CODE
  code?: string
  data?: any
  error: any

  constructor(e?: AxiosError | any, eMap?: ErrorMap) {
    super()

    const { message, statusCode, errorCode = 'WebHttp::UNKWON' } = eMap || {}

    this._isCustomError = true
    this._isWebHttpError = true
    this.message = message || e?.message || DEFAULT_ERROR_MSG
    this.statusCode = statusCode || e?.statusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode = errorCode || e?.code || e?.errorCode || DEFAULT_ERROR_CODE
    this.error = e?.error || e
    this.data = e?.data || undefined
  }
}
