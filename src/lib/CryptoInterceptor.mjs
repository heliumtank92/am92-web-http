import JoseCryptoSubtle from '@am92/jose-crypto-subtle'
import CONTEXT from '../CONSTANTS/CONTEXT.mjs'

const CryptoInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess]
}

export default CryptoInterceptor

async function requestSuccess (config) {
  const axiosRetry = config['axios-retry']
  if (axiosRetry) { return config }

  const { webHttpContext, webHttpConfig, data } = config
  const publicKey = webHttpContext.get(CONTEXT.PUBLIC_KEY)

  if (webHttpConfig.disableCrypto) { return config }

  // Generate and Manage Keys
  const { encryptionKey, encryptedEncryptionKey } = await JoseCryptoSubtle.generateAndWrapKey(publicKey)
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

async function responseSuccess (response) {
  const { config = {}, data: body = {} } = response
  const { webHttpConfig } = config

  if (webHttpConfig.disableCrypto) { return response }

  // Extract Encrypted Data
  const { data } = body
  if (data) {
    const { payload } = data
    // Decrypt Data
    const {
      data: decryptedData,
      statusCode,
      status,
      message,
      error
    } = await JoseCryptoSubtle.decryptData(payload, webHttpConfig.encryptionKey)
    response.data = decryptedData
    response.status = statusCode
    response.statusText = status
    
    // throw if status code is not 2xx
    if (statusCode < 200 || statusCode >= 300) {
      const err = new Error(message)
      // mimic axios response error structure to be passed on to response error handler
      response.data = {
        status: statusCode,
        statusText: status,
        message,
        error,
      }
      err.response = response
      throw err
    }
  }

  return response
}
