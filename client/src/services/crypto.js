import nacl from 'tweetnacl';
import { decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

// Sign a message using the user's secret key
export const signMessage = (message, secretKeyBase64) => {
  try {
    const messageBytes = decodeUTF8(JSON.stringify(message));
    const secretKey = decodeBase64(secretKeyBase64);
    const signature = nacl.sign.detached(messageBytes, secretKey);
    return encodeBase64(signature);
  } catch (error) {
    console.error('Signing error:', error);
    throw new Error('Failed to sign message');
  }
};

// Verify a signature
export const verifySignature = (message, signatureBase64, publicKeyBase64) => {
  try {
    const messageBytes = decodeUTF8(JSON.stringify(message));
    const signature = decodeBase64(signatureBase64);
    const publicKey = decodeBase64(publicKeyBase64);
    return nacl.sign.detached.verify(messageBytes, signature, publicKey);
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};
