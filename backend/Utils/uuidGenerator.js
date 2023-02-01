// UUID
const uuid = require("uuid");

// Dotenv
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../.env")});

const namespace = process.env.uuidNamespace;

const generateUUID = (email) => {
    return uuid.v5(email, namespace);
};

module.exports = {generateUUID};