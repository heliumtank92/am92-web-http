import { AxiosError } from 'axios'
import JoseCryptoSubtle from '@am92/jose-crypto-subtle'
import { WebHttpError } from '../WebHttpError'

import { WebHttpRequestConfig, WebHttpResponse } from '../TYPES'
import { WEB_HTTP_CONTEXT } from '../CONSTANTS'
import { MISSING_PUBLIC_KEY_ERROR } from '../CONSTANTS/ERRORS'

/** @ignore */
const CryptoInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess]
}

export default CryptoInterceptor

/** @ignore */
async function requestSuccess(
  config: WebHttpRequestConfig
): Promise<WebHttpRequestConfig> {
  const axiosRetry = config['axios-retry']
  if (axiosRetry) {
    return config
  }

  const { webHttpContext, webHttpConfig, data } = config
  if (webHttpConfig.disableCrypto) {
    return config
  }

  const publicKey = webHttpContext.get(WEB_HTTP_CONTEXT.PUBLIC_KEY) as string
  if (!publicKey) {
    throw new WebHttpError(undefined, MISSING_PUBLIC_KEY_ERROR)
  }

  // Generate and Manage Keys
  const { encryptionKey, encryptedEncryptionKey } =
  !!webHttpConfig.encryptionKey && !!webHttpConfig.encryptedEncryptionKey
    ? {
        encryptionKey: webHttpConfig.encryptionKey,
        encryptedEncryptionKey: webHttpConfig.encryptedEncryptionKey,
      }
    : await JoseCryptoSubtle.generateAndWrapKey(publicKey);

  // Encrypt Body
  if (data) {
    const payload = await JoseCryptoSubtle.encryptData(data, encryptionKey)
    config.data = { payload }
  }

  // Return Config
  return config
}

/** @ignore */
async function responseSuccess(
  response: WebHttpResponse
): Promise<WebHttpResponse> {
  const { config, data: body } = response
  const { webHttpConfig } = config

  if (webHttpConfig.disableCrypto) {
    return response
  }

  // Extract Encrypted Data
  const { data } = body
  if (data) {
    const { payload } = data
    // Decrypt Data
    const decryptedData = await JoseCryptoSubtle.decryptData(
      payload,
      webHttpConfig.encryptionKey as CryptoKey
    )
    response.data = decryptedData
    handleEncryptedErrorResponse(response)
  }

  return response
}

/** @ignore */
function handleEncryptedErrorResponse(response: WebHttpResponse): void {
  const { data: body, config, request } = response
  const { statusCode, status, message } = body
  const { validateStatus } = config

  const isValid = (validateStatus && validateStatus(statusCode)) || false

  if (!isValid) {
    const error = new AxiosError(status, statusCode, config, request, response)
    throw error
  }
}
