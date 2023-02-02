// Packages
const {Client} = require("pg");
const bcrypt = require("bcrypt");
const validator = require("validator");
const moment = require("moment");

// Helper functions
const aes256 = require("aes256");
const {generateNoteId, generateToken} = require("../../Utils/nanoIdGenerator");
const { deriveKey, encryptKey, decryptKey } = require("../../Utils/keyHandling");
const { hasNotExpired } = require("../../Utils/timeHandling");

// Dotenv
const path = require("path");
const { sendEmailVerificationLink } = require("../email/emailHandler");
require("dotenv").config({path: path.resolve(__dirname, "../../.env")});

// Database setup
const DB = new Client({
    host: process.env.pgHost,
    port: process.env.pgPort,
    user: process.env.pgUser,
    password: process.env.pgPassword,
    database: process.env.pgDB,
    log: console.log
});

DB.connect();

// USERS ---------------------------------------------------------

const getUserByUUID = async (uuid) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUserByUUID",
            text: "SELECT * FROM users WHERE uuid = $1",
            values: [uuid]
        };
        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("No users found by that uuid");
            }
        }, err => {
            reject(err);
        });
    });
};

const getUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getUserByEmail",
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        };
        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("No users found with that email");
            }
        }, err => {
            reject(err);
        });
    });
};

const getAllUsers = async () => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getAllUsers",
            text: "SELECT * FROM users",
            values: []
        };
        DB.query(query).then(response => {
            if (response.rows) {
                resolve(response.rows);
            } else {
                reject("No users found");
            }
        }, err => {
            reject(err);
        });
    });
};

/*
let newUserObject = {
    uuid : uuid,
    name: "first last",
    email: "email@syntaxiscs.com",
    password: "psd",
    userType: "user", // or admin
    planType: "free", // or paid
    email_verified: false
    email_verified_date: null
    dateJoined: "currentDate"
};
*/

const createUser = async (newUser) => {
    return new Promise((resolve, reject) => {
        // Check if user exists
        let checkQuery = {
            name: "checkUserExists",
            text: "SELECT * FROM users WHERE email = $1",
            values: [newUser.email]
        };
        DB.query(checkQuery).then(response => {
            if (response.rows.length > 0) {
                reject("user already exists");
            } else {

                // Create user
                bcrypt.genSalt(10).then(salt => {
                    // hash password
                    bcrypt.hash(newUser.password, salt).then(hashedPassword => {
                        // Normalize Email
                        let options = {
                            gmail_lowercase: true,
                            gmail_convert_googlemaildotcom: true,
                            outlookdotcom_lowercase: true,
                            yahoo_lowercase: true,
                            icloud_lowercase: true,
                            gmail_remove_subaddress: true,
                            outlookdotcom_remove_subaddress: true,
                            yahoo_remove_subaddress: true,
                            icloud_remove_subaddress: true
                        };
                        const normalizedEmail = validator.normalizeEmail(newUser.email, options);

                        // Generate key for user notes
                        deriveKey(newUser.uuid, newUser.password, salt).then(derivedKey => {
                            // Encrypt Key
                            let encryptedKey = encryptKey(derivedKey);

                            // Add key to database
                            createKey(newUser.uuid, encryptedKey).then(response => {
                                console.info(response);
                            }, err => {
                                console.error(err);
                            });
                        }, err => {
                            console.error(err);
                        });

                        // DB query
                        let query = {
                            name: "createUser",
                            text: "INSERT INTO users (uuid, name, email, password, user_type, plan_type, email_verified, email_verified_date, date_joined) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                            values: [newUser.uuid, newUser.name, normalizedEmail, hashedPassword, newUser.userType, newUser.planType, newUser.verifyEmail, newUser.emailVerifyDate, newUser.dateJoined]
                        };
                        DB.query(query).then(response => {

                            sendEmailVerificationLink(normalizedEmail).then(success => {
                                resolve(response);
                            }, err => {
                                reject(err);
                            });

                        }, err => {
                            reject(err);
                        });
                        // Error handling
                    }, err => {
                        console.error(err);
                        reject("Failed during the hashing process");
                    });
                }, err => {
                    console.error(err);
                    reject("Failed during the salting process");
                });
            }
        });
    });
};

const deleteUser = async (email) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteUser",
            text: "DELETE FROM users WHERE email = $1",
            values: [email]
        };
        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// change name (not username)
const changeUserName = async (email, newName) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "changeUserName",
            text: "UPDATE users SET name = $1 WHERE email = $2",
            values: [newName, email]
        };
        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// changePassword
const changeUserPassword = async (email, newPassword) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            // check if passwords are the same
            bcrypt.compare(newPassword, user.password, (err, same) => {
                if (err) {
                    reject(err);
                }
                
                if (!same) {
                    bcrypt.genSalt(10).then(salt => {
                        // Update Note Encryption and derive new key
                        updateAllNoteEncryption(user.uuid, newPassword, salt).then(noteEncryptionResponse => {
                            bcrypt.hash(newPassword, salt).then(hashedPassword => {
                                let query = {
                                    name: "changeUserPassword",
                                    text: "UPDATE users SET password = $1 WHERE email = $2",
                                    values: [hashedPassword, email]
                                };
                                DB.query(query).then(response => {
                                    console.info(`${noteEncryptionResponse}`);
                                    resolve(`${noteEncryptionResponse}: ${response}`);
                                }, err => {
                                    reject(err);
                                });
                            }, err => {
                                console.error(err);
                                reject("Failed during the hashing process");
                            });
                        }, err => {
                            console.error(`Could not update note encryption: ${err}`);
                        });
                    }, err => {
                        console.error(err);
                        reject("Failed during the salting process");
                    });
                } else {
                    reject("Passwords cannot match");
                }
            });
        }, err => {
            console.error(err);
            reject("Could not verify password: getUserByEmail");
        });
    });
};

// changeEmail
const changeUserEmail = async (email, newEmail) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            if (user.email === newEmail) {
                reject("Emails cannot match");
            } else {
                
                let query = {
                    name: "changeUserEmail",
                    text: "UPDATE users SET email = $1 WHERE email = $2",
                    values: [newEmail, email]
                };
                DB.query(query).then(response => {
                    resolve(response);
                }, err => {
                    console.error(err);
                    reject("Could not change email");
                });
            }
        }, err => {
            console.error(err);
            reject("Could not verify email: getUserByEmail");
        });
    });
};

// Verify Email
const verifyEmail = async (email) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {

            // Email not verified
            if (!user.email_verified) {
                let verifiedDate = new Date();

                let query = {
                    name: "verifyEmail",
                    text: "UPDATE users SET email_verified = $1,email_verified_date = $2 WHERE email = $3",
                    values: [true, verifiedDate, email]
                };

                DB.query(query).then(response => {
                    // send email verified email
                    resolve(`${user.uuid} has verified the email ${email}`);
                }, err => {
                    console.error(err);
                    reject("Could not verify email");
                });
            } else {
                // email already verified
                reject(`${user.uuid} has already verified the email ${email} on ${user.email_verified_date ? user.email_verified_date : "an unknown date and time"}`);
            }

        }, err => {
            console.error(err);
            reject("User does not exist");
        });
    });
};

// authenticate
const authenticate = async (email, password) => {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            bcrypt.compare(password, user.password).then(result => {
                if (result) {
                    resolve("Authenticated");
                } else {
                    reject("Incorrect password");
                }
            }, err => {
                reject(err);
            });
        }, err => {
            reject(`Incorrect email \n ${err}`);
        });
    });
};

// NOTES ---------------------------------------------------------

// v Note database schema v
// uuid user_id content updated_date creation_date

const getNoteById = async (id, userId) => {
    return new Promise((resolve, reject) => {
        // get note from database
        let query = {
            name: "getNoteById",
            text: "SELECT * FROM notes WHERE id = $1",
            values: [id]
        };

        // Make database query
        DB.query(query).then(response => {

            if (response.rows[0]) {
                // Set DBNote to constant
                const note = response.rows[0];

                // Note ownership validation
                if (note.user_id === userId) {
                    // get encryption key
                    getKey(userId).then(key => {
                        // decrypt
                        let decryptedText = aes256.decrypt(key, note.content);

                        // Write plaintext
                        note.content = decryptedText;

                        // Send note
                        resolve(note);
                    }, err => {
                        reject("Could not get encryption key");
                    });
                } else {
                    reject("Forbidden");
                }

            } else {
                reject("No notes");
            }
        }, err => {
            // error with database
            reject(err);
        });
    });
};

// for user only, admins cannot retrieve all notes only their as any other user
const getAllNotes = async (userEmail) => {
    return new Promise((resolve, reject) => {
        // get user from email to get user id
        getUserByEmail(userEmail).then(user => {
            // get notes for user
            let query = {
                name: "getAllNotes",
                text: "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_date DESC",
                values: [user.uuid]
            };

            // Make database query
            DB.query(query).then(response => {
                // if any notes exist
                if (response.rows.length > 0) {
                    // decrypt
                    let decryptedNotes = [];

                    // get encryption key
                    getKey(user.uuid).then(key => {
                        response.rows.forEach(note => {
                            let decryptedText = aes256.decrypt(key, note.content);
    
                            note.content = decryptedText;
                            decryptedNotes.push(note);

                            // send decrypted notes
                            resolve({notes: decryptedNotes});
                        });
                    }, err => {
                        reject("Could not get encryption key");
                    });
                } else {
                    // No notes exist for specified user
                    resolve("Could not find any notes for specified user");
                }

            }, err => {
                // error with database
                reject(err);
            });
        }, err => { // getUserByEmail error
            console.error(err);
            reject("Could not validate user");
        });
    });
};

/*
let noteObject = {
    uuid,
    content,
};
*/

const createNote = async (noteObject) => {
    return new Promise((resolve, reject) => {
        // get user
        getUserByUUID(noteObject.uuid).then(user => {

            // prepare note

            // id
            let genNoteId = generateNoteId();
            checkNoteId(genNoteId).then(response => {}, err => {
                genNoteId = generateNoteId();
            });

            // Timestamps (updatedDate = creationDate (same time))
            let date = new Date();

            // get key
            getKey(user.uuid).then(key => {
                // encrypt content
                let encryptedText = aes256.encrypt(key, noteObject.content);

                // New Note Object
                let newNote = {
                    id: genNoteId,
                    userId: user.uuid,
                    content: encryptedText,
                    updatedDate: date,
                    creationDate: date
                };

                // Database query
                let query = {
                    name: "createNote",
                    text: "INSERT INTO notes (id, user_id, content, updated_date, creation_date) VALUES ($1,$2,$3,$4,$5)",
                    values: [newNote.id, newNote.userId, newNote.content, newNote.updatedDate, newNote.creationDate]
                };

                DB.query(query).then(response => {
                    if (response.rowCount > 0) {
                        // success
                        resolve(newNote);
                    } else {
                        reject("Could not create note");
                    }
                }, err => {
                    // fail
                    reject(err);
                });
            }, err => {
                reject("Could not get encryption key");
            });
        }, err => { // getUserByEmail Error
            console.error(err);
            reject("Could not validate user");
        });
    });
};

const deleteNote = async (id) => {
    return new Promise((resolve, reject) => {
        // Database query
        let query = {
            name: "deleteNote",
            text: "DELETE FROM notes WHERE id = $1",
            values: [id]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Delete all notes for specific user
const deleteAllNotes = async (userId) => {
    return new Promise((resolve, reject) => {
        // Database query
        let query = {
            name: "deleteAllNotes",
            text: "DELETE FROM notes WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

/* gets all notes associated with userId, derives key from new password, 
encrypts notes with new key and updates the notes and new key in database 
*/
const updateAllNoteEncryption = async (userId, newPassword, salt) => {
    return new Promise((resolve, reject) => {
        // get user
        getUserByUUID(userId).then(user => {
            // get decrypted notes
            getAllNotes(user.email).then(response => {
                console.log(response);
                if (response === "Could not find any notes for specified user") {

                    resolve(`Password Change Request for user ${userId} complete`);
                } else {
                    
                    let notes = response.notes;
                    // derive key from new password
                    deriveKey(userId, newPassword, salt).then(key => {
                        console.log(key);
                        // Encrypt key
                        let encryptedKey = encryptKey(key);
                        
                        // Update key in database
                        updateKey(userId, encryptedKey).then(updated => {
                            // Run through decrypted notes and update them
                            notes.forEach(note => {
                                // Update notes with current content to use new key for encryption
                                updateNote(userId, note.id, notes.content).then(response => {
                                    console.info(`Updated note encryption (id: ${note.id}) at ${new Date()} during pending password change request`);
                                }, err => {
                                    console.info(`Failed to update note encryption (id: ${note.id}) at ${new Date()} during pending password change request`);
                                });
                            });

                            resolve(`Password Change Request for user ${userId} complete`);
                        }, err => {
                            reject("Could not update key");
                        });
                    }, err => {
                        console.error(err);
                    });
                }
            }, err => {
                console.error(err);
            });
        }, err => {
            reject(`Could not get user by id: ${err}`);
        });
    });
};

const updateNote = async (userId, id, newContent) => {
    return new Promise((resolve, reject) => {
        // timestamp
        let date = new Date();

        // get encryption key
        getKey(userId).then(key => {
            // encrypt content
            let encryptedText = aes256.encrypt(key, newContent);

            // Database query
            let query = {
                name: "updateNote",
                text: "UPDATE notes SET content = $1,updated_date = $2 WHERE id = $3",
                values: [encryptedText, date, id]
            };

            DB.query(query).then(response => {
                resolve(response);
            }, err => {
                reject(err);
            });
        }, err => {
            reject("Could not get encryption key");
        });
    });
};

// Check id
// Check if id exists already
const checkNoteId = async (id) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkNoteId",
            text: "SELECT * FROM notes WHERE id = $1",
            values: [id]
        };

        DB.query(query).then(response => {
            if (response.rows) {
                reject(false);
            } else {
                resolve(true);
            }
        }, err => {
            console.error(err);
            reject(false);
        });
    });
};

// Keys

// key is already encrypted
const createKey = async (userId, key) => {
    return new Promise((resolve, reject) => {
        // timeStamp = updated_date = creation_date on creation
        let timeStamp = new Date();


        let query = {
            name: "createKey",
            text: "INSERT INTO keys (user_id, key, updated_date, creation_date) VALUES ($1,$2,$3,$4)",
            values: [userId, key, timeStamp, timeStamp]
        };

        DB.query(query).then(response => {
            if (response.rowCount > 0) {
                // success
                resolve(`Key for user: ${userId} created on ${timeStamp}`);
            } else {
                reject("Could not create key!");
            }
        }, err => {
            // fail
            console.log(err);
            reject(err);
        });
    });
};

const updateKey = async (userId, key) => {
    return new Promise((resolve, reject) => {
        let updatedTimestamp = new Date();


        let query = {
            name: "updateKey",
            text: "UPDATE keys SET key = $1,updated_date = $2 WHERE user_id = $3",
            values: [key, updatedTimestamp, userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

const deleteKey = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteKey",
            text: "DELETE FROM keys WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Key needs to be decrypted
const getKey = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getKey",
            text: "SELECT * FROM keys WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            // decrypt key
            if (response.rows[0]) {
                let key = response.rows[0].key;

                let decryptedKey = decryptKey(key);

                resolve(decryptedKey);
            } else {
                reject("Could not get key");
            }
        }, err => {
            reject(err);
        });
    });
};

// Password Tokens
const addPasswordToken = async (userId, token) => {
    return new Promise((resolve, reject) => {
        // check if token exists
        getPasswordToken(userId).then(token => {
            // delete then create
            deletePasswordToken(userId).then(success => {
                // Token deleted, create new
                let expire = moment().add(10, 'minutes').toISOString();

                const url = `http://localhost:9801/forgotpassword/${token}`;

                let query = {
                    name: "addPasswordToken",
                    text: "INSERT INTO password_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                    values: [userId, token, expire]
                };

                DB.query(query).then(response => {
                    if (response.rowCount > 0) {
                        // success
                        resolve(url);
                    } else {
                        reject("Could not add token");
                    }
                }, err => {
                    // fail
                    reject(err);
                });
            }, err => {
                // failed to delete
                console.error(err);
                reject("Token already exists, could not delete old token, therefore did not create new token");
            });
        }, err => {
            // token does not exist, preceed as normal
            let expire = moment().add(10, 'minutes').toISOString();

            const url = `http://localhost:9801/forgotpassword/${token}`;

            let query = {
                name: "addPasswordToken",
                text: "INSERT INTO password_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                values: [userId, token, expire]
            };

            DB.query(query).then(response => {
                if (response.rowCount > 0) {
                    // success
                    resolve(url);
                } else {
                    reject("Could not add token");
                }
            }, err => {
                // fail
                reject(err);
            });
        });
    });
};

// get token by User UUID
const getPasswordToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getPasswordToken",
            text: "SELECT * FROM password_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Could not get token");
            }
        }, err => {
            reject(err);
        });
    });
};

// Check which user is associated with a token (if it exists)
const checkPasswordToken = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkPasswordToken",
            text: "SELECT * FROM password_tokens WHERE token = $1",
            values: [token]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                // Checks if token has expired only resolves if it hasn't
                if (hasNotExpired(response.rows[0].expire)) {
                    resolve(response.rows[0]);
                } else {
                    // if token has expired then delete and reject
                    deletePasswordToken(response.rows[0].user_id).then(success => {
                        reject("Token has expired");
                    }, err => {
                        console.error(err);
                        reject("Token has expired");
                    });
                }
            } else {
                reject("Token does not exist");
            }
        });
    });
};

const deletePasswordToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deletePasswordToken",
            text: "DELETE FROM password_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};

// Verification Tokens
const addVerificationToken = async (userId, token) => {
    return new Promise((resolve, reject) => {
        // check if already exists
        getVerificationToken(userId).then(token => {
            // delete then create
            deleteVerificationToken(userId).then(success => {
                // create token
                let expire = moment().add(10, "minutes").toISOString();

                const url = `http://localhost:9801/verifyemail/${token}`;

                let query = {
                    name: "addVerificationToken",
                    text: "INSERT INTO verification_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                    values: [userId, token, expire]
                };

                DB.query(query).then(response => {
                    if (response.rowCount > 0) {
                        // success
                        resolve(url);
                    } else {
                        reject("Could not add token");
                    }
                });
                // -------------------
            }, err => {
                // failed to delete
                console.error(err);
                reject("Token already exists, could not delete old token, therefore did not create new token");
            });
        }, err => {
            // if no then create
            let expire = moment().add(10, "minutes").toISOString();

            const url = `http://localhost:9801/verifyemail/${token}`;

            let query = {
                name: "addVerificationToken",
                text: "INSERT INTO verification_tokens (user_id, token, expire) VALUES ($1,$2,$3)",
                values: [userId, token, expire]
            };

            DB.query(query).then(response => {
                if (response.rowCount > 0) {
                    // success
                    resolve(url);
                } else {
                    reject("Could not add token");
                }
            });
            // create ---------------------
        });
    });
};

// get token  by user UUID
const getVerificationToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "getVerificationToken",
            text: "SELECT * FROM verification_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                resolve(response.rows[0]);
            } else {
                reject("Could not get token");
            }
        }, err => {
            reject(err);
        });
    });
};

const checkVerificationToken = async (token) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "checkVerificationToken",
            text: "SELECT * FROM verification_tokens WHERE token = $1",
            values: [token]
        };

        DB.query(query).then(response => {
            if (response.rows[0]) {
                // Checks if token expired only resolves if it hasn't
                if (hasNotExpired(response.rows[0].expire)) {
                    resolve(response.rows[0]);
                } else {
                    // if token expired delete and reject
                    deleteVerificationToken(response.rows[0].user_id).then(success => {
                        reject("Token has expired");
                    }, err => {
                        console.error(err);
                        reject("Token has expired");
                    });
                }
            } else {
                reject("Token does not exist");
            }
        });
    });
};

const deleteVerificationToken = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = {
            name: "deleteVerificationToken",
            text: "DELETE FROM verification_tokens WHERE user_id = $1",
            values: [userId]
        };

        DB.query(query).then(response => {
            resolve(response);
        }, err => {
            reject(err);
        });
    });
};



// Exports
module.exports = {
    // Users
    getUserByUUID, 
    getUserByEmail, 
    getAllUsers, 
    createUser, 
    deleteUser, 
    changeUserName,
    changeUserPassword, 
    changeUserEmail,
    verifyEmail,
    authenticate,
    
    // Notes
    getNoteById,
    getAllNotes,
    createNote,
    deleteNote,
    deleteAllNotes,
    updateAllNoteEncryption, // Password change
    updateNote,

    // Keys
    createKey,
    updateKey,
    deleteKey,
    getKey,

    // Password Tokens
    addPasswordToken,
    getPasswordToken,
    checkPasswordToken,
    deletePasswordToken,

    // Verification Tokens
    addVerificationToken,
    getVerificationToken,
    checkVerificationToken,
    deleteVerificationToken
};