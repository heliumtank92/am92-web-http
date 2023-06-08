import { AxiosError } from 'axios'
import { ErrorMap } from './INTERNAL_TYPES'

const DEFAULT_ERROR_MSG = 'Web Http Error'
const DEFAULT_ERROR_STATUS_CODE = 500
const DEFAULT_ERROR_CODE = 'WebHttp::UNKWON'

export default class WebHttpError extends Error {
  _isCustomError = true
  _isWebHttpError = true
  message: string
  statusCode: number
  errorCode: string
  code?: string
  data?: any
  error: any

  constructor(e?: AxiosError | any, eMap?: ErrorMap) {
    super()

    this.message = eMap?.message || e?.message || DEFAULT_ERROR_MSG
    this.statusCode =
      eMap?.statusCode || e?.statusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode =
      eMap?.errorCode || e?.code || e?.errorCode || DEFAULT_ERROR_CODE
    this.error = e?.error || e
    this.data = e?.data || undefined
  }
}
