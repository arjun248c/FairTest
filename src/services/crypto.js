import nacl from 'tweetnacl';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Signs a message using the user's secret key
 * @param {Object} message - Message to sign
 * @param {string} secretKey - Secret key in base64 format
 * @returns {string} - Signature in base64 format
 */
export const signMessage = (message, secretKey) => {
  try {
    const messageBytes = decodeUTF8(JSON.stringify(message));
    const secretKeyBytes = decodeBase64(secretKey);
    const signature = nacl.sign.detached(messageBytes, secretKeyBytes);
    return encodeBase64(signature);
  } catch (error) {
    console.error('Signing error:', error);
    throw new Error('Failed to sign message');
  }
};

/**
 * Verifies a signature
 * @param {Object} message - Original message
 * @param {string} signature - Signature in base64 format
 * @param {string} publicKey - Public key in base64 format
 * @returns {boolean} - True if signature is valid
 */
export const verifySignature = (message, signature, publicKey) => {
  try {
    const messageBytes = decodeUTF8(JSON.stringify(message));
    const signatureBytes = decodeBase64(signature);
    const publicKeyBytes = decodeBase64(publicKey);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};
