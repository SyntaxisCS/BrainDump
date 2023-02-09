// Packages
const pbkdf2 = require("pbkdf2");
const aes256 = require("aes256");

// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../.env")});


const deriveKey = (userId, plainTextPassword, salt) => {
    return new Promise((resolve, reject) => {
        pbkdf2.pbkdf2(plainTextPassword, salt, 100000, 512, "sha512", (err, key) => {
            if (err) {
                reject(err);
            } else {
                let base64 = key.toString("base64");

                resolve(base64);
            }
        });
    });
};

const encryptKey = (key) => {
    const encryptionKey = process.env.noteEncryptionKey;

    let encryptedKey = aes256.encrypt(encryptionKey, key);

    return encryptedKey;
};

const decryptKey = (key) => {
    const encryptionKey = process.env.noteEncryptionKey;

    let plainTextKey = aes256.decrypt(encryptionKey, key);

    return plainTextKey;
};

module.exports = {deriveKey, encryptKey, decryptKey};