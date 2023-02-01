const {customAlphabet} = require("nanoid");

// generate id
const nanoAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

const generateNoteId = () => {
    let nano = customAlphabet(nanoAlphabet, 16);
    return nano();
};

// password reset, email verify, email reset
const generateToken = () => {
    let nano = customAlphabet(nanoAlphabet, 32);

    return nano();
};

module.exports = {generateNoteId, generateToken};