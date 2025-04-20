const crypto = require('crypto');

/**
 * Encrypts text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @param {Buffer} key - Encryption key
 * @param {Buffer} iv - Initialization vector
 * @returns {string} - Encrypted text in hex format
 */
const encrypt = (text, key, iv) => {
  const algorithm = 'aes-256-cbc';
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

/**
 * Decrypts text using AES-256-CBC
 * @param {string} encrypted - Encrypted text in hex format
 * @param {Buffer} key - Encryption key
 * @param {Buffer} iv - Initialization vector
 * @returns {string} - Decrypted text
 */
const decrypt = (encrypted, key, iv) => {
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Generates a random encryption key and IV
 * @returns {Object} - Object containing key and iv
 */
const generateKeyAndIV = () => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  return {
    key: key.toString('hex'),
    iv: iv.toString('hex')
  };
};

module.exports = {
  encrypt,
  decrypt,
  generateKeyAndIV
};
