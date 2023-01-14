import JoseCryptoSubtle from '@am92/jose-crypto-subtle'

const CryptoInterceptor = {
  request: [requestSuccess, requestError],
  response: [responseSuccess, responseError]
}

export default CryptoInterceptor

async function requestSuccess (config) {
  const { webHttp: { publicKey } = {}, data = {} } = config

  // Generate and Manage Keys
  const { encryptionKey, encryptedEncryptionKey } = await JoseCryptoSubtle.generateAndWrapKey(publicKey)
  config.webHttp.encryptionKey = encryptionKey
  config.webHttp.encryptedEncryptionKey = encryptedEncryptionKey

  // Encrypt Body
  const payload = await JoseCryptoSubtle.encryptData(data, encryptionKey)
  config.data = { payload }

  // Return Config
  return config
}

function requestError (error) { }

function responseSuccess (response) { }

function responseError (error) { }
