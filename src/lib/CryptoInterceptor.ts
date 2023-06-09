import { AxiosError } from 'axios'
import JoseCryptoSubtle from '@am92/jose-crypto-subtle'

import { WebHttpRequestConfig, WebHttpResponse } from '../TYPES'
import { WEB_HTTP_CONTEXT_MAP } from '../CONSTANTS'

const CryptoInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess]
}

export default CryptoInterceptor

async function requestSuccess(config: WebHttpRequestConfig) {
  const axiosRetry = config['axios-retry']
  if (axiosRetry) {
    return config
  }

  const { webHttpContext, webHttpConfig, data } = config
  const publicKey = webHttpContext.get(
    WEB_HTTP_CONTEXT_MAP.PUBLIC_KEY
  ) as string

  if (webHttpConfig.disableCrypto) {
    return config
  }

  // Generate and Manage Keys
  const { encryptionKey, encryptedEncryptionKey } =
    await JoseCryptoSubtle.generateAndWrapKey(publicKey)
  config.webHttpConfig.encryptionKey = encryptionKey
  config.webHttpConfig.encryptedEncryptionKey = encryptedEncryptionKey

  // Encrypt Body
  if (data) {
    const payload = await JoseCryptoSubtle.encryptData(data, encryptionKey)
    config.data = { payload }
  }

  // Return Config
  return config
}

async function responseSuccess(response: WebHttpResponse) {
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

function handleEncryptedErrorResponse(response: WebHttpResponse) {
  const { data: body, config, request } = response
  const { statusCode, status, message } = body
  const { validateStatus } = config

  const isValid = (validateStatus && validateStatus(statusCode)) || false

  if (!isValid) {
    const error = new AxiosError(status, statusCode, config, request, response)
    throw error
  }
}
