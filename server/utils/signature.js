const nacl = require('tweetnacl');
const { decodeUTF8, encodeBase64, decodeBase64 } = require('tweetnacl-util');

/**
 * Generates a keypair for digital signatures
 * @returns {Object} - Object containing publicKey and secretKey in base64 format
 */
const generateKeypair = () => {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey)
  };
};

/**
 * Signs a message using a secret key
 * @param {string} message - Message to sign
 * @param {string} secretKeyBase64 - Secret key in base64 format
 * @returns {string} - Signature in base64 format
 */
const signMessage = (message, secretKeyBase64) => {
  const messageBytes = decodeUTF8(message);
  const secretKey = decodeBase64(secretKeyBase64);
  const signature = nacl.sign.detached(messageBytes, secretKey);
  return encodeBase64(signature);
};

/**
 * Verifies a signature
 * @param {string} message - Original message
 * @param {string} signatureBase64 - Signature in base64 format
 * @param {string} publicKeyBase64 - Public key in base64 format
 * @returns {boolean} - True if signature is valid
 */
const verifySignature = (message, signatureBase64, publicKeyBase64) => {
  const messageBytes = decodeUTF8(message);
  const signature = decodeBase64(signatureBase64);
  const publicKey = decodeBase64(publicKeyBase64);
  return nacl.sign.detached.verify(messageBytes, signature, publicKey);
};

module.exports = {
  generateKeypair,
  signMessage,
  verifySignature
};
