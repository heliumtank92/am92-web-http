import JoseCryptoSubtle from '@am92/jose-crypto-subtle'

const CryptoInterceptor = {
  request: [requestSuccess],
  response: [responseSuccess]
}

export default CryptoInterceptor

async function requestSuccess (config) {
  const { webHttp: { publicKey } = {}, data = {} } = config

  // Generate and Manage Keys
  const { encryptionKey, encryptedEncryptionKey } = await JoseCryptoSubtle.generateAndWrapKey(publicKey)
  config.webHttp.encryptionKey = encryptionKey
  config.webHttp.encryptedEncryptionKey = encryptedEncryptionKey

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
  const { webHttp: { encryptionKey } = {} } = config

  // Extract Encrypted Data
  const { data = {} } = body
  const { payload } = data

  // Decrypt Data
  const decryptedData = await JoseCryptoSubtle.decryptData(payload, encryptionKey)
  response.data = decryptedData

  return response
}
