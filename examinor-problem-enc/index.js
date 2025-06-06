const crypto = require('crypto');

const PROBLEM_STATEMENT = 'What is 2 + 2?';
const OPTION_1 = '4';
const OPTION_2 = '6';
const OPTION_3 = '8';
const OPTION_4 = '10';
//function = takes text and key to encrypt
//iv for different output(seeding)
function encrypt(text, key, iv) {

    //encryption algo for input only with key
    //algo used = aes-256-cbc
    const algorithm = 'aes-256-cbc';

    // cipher = takes inputs 
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    //update the cipher, utf8 = askii , hex = hexadecimal string
    let encrypted = cipher.update(text, 'utf8', 'hex'); // 0123456789ABCDEF

    //we want output in hex
    encrypted += cipher.final('hex');   

    return encrypted; 
}

function decrypt(encrypted, key, iv) {
    const algorithm = 'aes-256-cbc';
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// initialize key and iv
const key = crypto.randomBytes(32); // IIT BOMBAY SECRET 223
const iv = crypto.randomBytes(16);

//call encrypt *5
const encryptedProblem = encrypt(PROBLEM_STATEMENT, key, iv);
const encryptedOption1 = encrypt(OPTION_1, key, iv);
const encryptedOption2 = encrypt(OPTION_2, key, iv);
const encryptedOption3 = encrypt(OPTION_3, key, iv);
const encryptedOption4 = encrypt(OPTION_4, key, iv);

// print
console.log('Problem statement:', encryptedProblem);
console.log('Option 1:', encryptedOption1);
console.log('Option 2:', encryptedOption2);
console.log('Option 3:', encryptedOption3);
console.log('Option 4:', encryptedOption4);


//call decrypt
const decryptedProblem = decrypt(encryptedProblem, key, iv);
const decryptedOption1 = decrypt(encryptedOption1, key, iv);
const decryptedOption2 = decrypt(encryptedOption2, key, iv);
const decryptedOption3 = decrypt(encryptedOption3, key, iv);
const decryptedOption4 = decrypt(encryptedOption4, key, iv);


//print decrypt
console.log('Problem statement:', decryptedProblem);
console.log('Option 1:', decryptedOption1);
console.log('Option 2:', decryptedOption2);
console.log('Option 3:', decryptedOption3);
console.log('Option 4:', decryptedOption4); 