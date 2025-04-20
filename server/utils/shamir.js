const sss = require('shamirs-secret-sharing');

/**
 * Splits a secret into multiple shares
 * @param {Buffer|string} secret - Secret to split
 * @param {number} shares - Number of shares to create
 * @param {number} threshold - Minimum number of shares required to reconstruct the secret
 * @returns {Array} - Array of shares
 */
const splitSecret = (secret, shares, threshold) => {
  const secretBuffer = Buffer.from(secret);
  const sharesArray = sss.split(secretBuffer, { shares, threshold });
  return sharesArray.map(share => share.toString('hex'));
};

/**
 * Combines shares to reconstruct the secret
 * @param {Array} shares - Array of shares in hex format
 * @returns {string} - Reconstructed secret
 */
const combineShares = (shares) => {
  const sharesBuffers = shares.map(share => Buffer.from(share, 'hex'));
  const recovered = sss.combine(sharesBuffers);
  return recovered.toString();
};

module.exports = {
  splitSecret,
  combineShares
};
