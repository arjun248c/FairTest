

const sss = require('shamirs-secret-sharing')
// key to encrypt
const secret = Buffer.from('Encryption key')

// create 3 shares, and min 2 are required
const shares = sss.split(secret, { shares: 3, threshold: 2 })
// ["asdid9d9", "asdid9d9", "asdid9d9"] = creates array with atleast 2 keys
const smallerShares = shares.slice(0,2); // ["asdid9d9"] ["asdid9d9"]
const recovered = sss.combine(smallerShares)// recover 2 keys

console.log(shares.map(x => x.toString('hex')));
console.log(recovered.toString()) // 'Encryption key'