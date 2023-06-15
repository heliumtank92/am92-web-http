/**
 * Internal type defination for ErrorMap to be passed to WebHttpError.
 *
 * @typedef {ErrorMap}
 * @private
 */
export type ErrorMap = {
  statusCode?: number
  message?: string
  errorCode?: string
}
