// UUID
const uuid = require("uuid");

// Crypto
const crypto = require("crypto");

// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../.env")});

const namespace = process.env.uuidNamespace;

const generateUUID = (email) => {
    // Generate Random Characters to ensure even repeat emails get a new uuid
    const randomBytes = crypto.randomBytes(4).toString("hex");
    const randomizedEmail = email+randomBytes;

    return uuid.v5(randomizedEmail, namespace);
};

module.exports = {generateUUID};