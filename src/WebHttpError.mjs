const DEFAULT_ERROR_MSG = 'Web Http Error'
const DEFAULT_ERROR_STATUS_CODE = 500
const DEFAULT_ERROR_CODE = 'WEB_HTTP_ERROR'

export default class WebHttpError extends Error {
  constructor (e = {}, eMap) {
    if (e._isCustomError && !eMap) { return e }

    super()

    const { message, statusCode, errorCode = 'WEN_HTTP::UNKWON', data } = eMap || {}
    const {
      message: eMessage,
      msg: eMsg,
      statusCode: eStatusCode,
      errorCode: eErrorCode,
      code: eCode
    } = e

    this._isCustomError = true
    this._isWebHttpError = true
    // this.service = SERVICE
    this.message = message || eMessage || eMsg || DEFAULT_ERROR_MSG
    this.statusCode = statusCode || eStatusCode || DEFAULT_ERROR_STATUS_CODE
    this.errorCode = errorCode || eErrorCode || eCode || DEFAULT_ERROR_CODE
    this.data = data
    this.error = {
      ...e,
      message: eMessage || this.message,
      errorCode: this.errorCode
    }
  }
}
