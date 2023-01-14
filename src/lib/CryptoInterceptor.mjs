import JoseCryptoSubtle from '@am92/jose-crypto-subtle'
import CONTEXT from '../CONSTANTS/CONTEXT.mjs'

const CryptoInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess]
}

export default CryptoInterceptor

async function requestSuccess (config) {
  const { webHttpContext, data = {} } = config
  const publicKey = webHttpContext.get(CONTEXT.PUBLIC_KEY)

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
  const { webHttpConfig: { encryptionKey } = {} } = config

  // Extract Encrypted Data
  const { data = {} } = body
  const { payload } = data

  // Decrypt Data
  const decryptedData = await JoseCryptoSubtle.decryptData(payload, encryptionKey)
  response.data = decryptedData

  return response
}
