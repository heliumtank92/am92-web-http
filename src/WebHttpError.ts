import { AxiosError } from 'axios'
import { WebHttpErrorMap } from './TYPES'

/** @ignore */
const DEFAULT_ERROR_MSG = 'Web Http Error'
/** @ignore */
const DEFAULT_ERROR_STATUS_CODE = 500
/** @ignore */
const DEFAULT_ERROR_CODE = 'WebHttp::UNKWON'

/**
 * Error class whose instance is thrown in case of any error.
 *
 * @class
 * @typedef {WebHttpError}
 * @extends {Error}
 */
export class WebHttpError extends Error {
  /**
   * Flag to identify if error is a custom error.
   */
  readonly _isCustomError = true
  /**
   * Flag to identoify if error is a WebHttpError.
   */
  readonly _isWebHttpError = true
  /**
   * API Error's message string.
   */
  message: string
  /**
   * API Error's HTTP status code.
   */
  statusCode: number
  /**
   * API Error's error code as sent by backend.
   */
  errorCode: string
  /**
   * API Error's error code as sent by backend.
   */
  code?: string
  /**
   * API Error's data object if sent with error.
   */
  data?: any
  /**
   * API Error's error object.
   */
  error?: any

  /**
   * Creates an instance of WebHttpError.
   *
   * @constructor
   * @param [e] AxiosError instance or error object from response body to wrap with WebHttpError.
   * @param [eMap] WebHttpErrorMap to rewrap error for better understanding.
   */
  constructor(e?: AxiosError | any, eMap?: WebHttpErrorMap) {
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
