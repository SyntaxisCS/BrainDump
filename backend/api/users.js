// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Passport
const passport = require("passport");

// Router initialization
const users = express.Router();

// Database Handlers
const {getUserByUUID, getUserByEmail, getAllUsers, createUser, deleteUser, changeUserName, changeUserEmail, changeUserPassword, deleteAllNotes, deleteKey, addPasswordToken, getPasswordToken, checkPasswordToken, deletePasswordToken, authenticate, checkVerificationToken, verifyEmail, isVerified, checkEmailChangeToken, deleteEmailChangeToken} = require("./database/dbHandler");

// Helpers
const {generateUUID} = require("../Utils/uuidGenerator");
const { generateToken } = require("../Utils/nanoIdGenerator");
const { sendForgotPasswordLink, sendEmailVerificationLink, sendAccountCreationNotification, sendPasswordChangeNotification, sendEmailChangeLink, sendEmailChangeNotification } = require("./email/emailHandler");

// Middleware
const ensureAuthentication = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    } else {
        res.status(400).send({error: "Not authenticated"});
    }
};

const forgotPasswordLimiter = rateLimit({
    windowMs: 60*60*1000,
    max: 15,
    message: "Whoa, slow down! You are making too many forgot password requests from this IP. Please try again later.",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()
});

const emailLimiter = rateLimit({
    windowMs: 60*60*1000,
    max: 15,
    message: "Whoa, slow down! You are making to many email-related requests from this IP. Please try again later.",
    statusCode: 429,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    store: new MemoryStore()

});

// Endpoints
users.get("/authenticate", (req, res) => {
    if (req.session) {
        res.status(200).send(req.session.user);
    } else {
        res.status(403).send({error: "Not authenticated"});
    }
});

// Login
users.post("/login", passport.authenticate("local", {failureMessage: {error: "Could not authenticate"}}), (req, res) => {
    // Get user
    getUserByEmail(req.body.email).then(user => {
        // Set authentication status
        req.session.authenticated = true;

        // Add user information to session
        let userSess = {
            uuid: user.uuid,
            email: user.email,
            userType: user.user_type
        };

        req.session.user = userSess;

        // Send user back
        res.status(200).send(userSess);
    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not find user"});
    });
});

// Logout
users.delete("/logout", ensureAuthentication, (req, res) => {
    if (req.session) {
        // passport logout
        req.logout((err) => {
            if (err) {
                console.error(err);
            }
        });
        
        // destroy session
        req.session.destroy(err => {
            if (err) {
                console.error(err);
                res.status(400).send("Unable to log out");
            }
        });
    } else {
        res.send();
    }
});

// Get all users
users.get("/", ensureAuthentication, (req, res) => {
    if (req.session.user.userType === "admin") {
        getAllUsers().then(users => {
            res.send({users: users});
        }, err => {
            if (err === "No users found") {
                res.status(204).send({error: err});
            } else {
                res.status(500).send({error: "Could not complete request"});
            }
        });
    } else {
        res.status(403).send({error: "You are not permitted to view this page"});
    }
});

// Get user by uuid
users.get("/:uuid", ensureAuthentication, (req, res) => {
    let uuid = req.params.uuid;

    // Ensure user is admin or same user
    if (req.session.user.userType === "admin" || req.session.user.uuid === uuid) {
        getUserByUUID(uuid).then(user => {
            res.send({user: user});
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not retrieve user"});
        });
    } else {
        res.status(403).send({error: "You are not permitted to view this page"});
    }
});

// Create Account
users.post("/create", (req, res) => {
    let date = new Date();

    let user = req.body;

    let userObject = {
        uuid: generateUUID(user.email),
        name: user.name,
        email: user.email,
        password: user.password,
        userType: "user",
        planType: "free",
        verifyEmail: false,
        emailVerifyDate: null,
        dateJoined: date
    };

    // Database
    createUser(userObject).then(success => {
        // redact password
        userObject.password = "server redacted";

        //
        sendEmailVerificationLink(userObject.email).then(sent => {

            sendAccountCreationNotification(userObject.email).then(success => {
                res.status(201).send(userObject);
            }, err => {
                res.status(500).send({error: "Account Created, Could not send email"});
            });

        }, err => {
            if (err === "Recipient not provided") {
                console.error(`User.js /create: ${err}`);
                res.status(500).send({error: "Server error"});
            } else if (err === "Could not send email") {
                console.error(err);
                res.status(500).send({error: err});
            } else {
                console.error(err);
                res.status(500).send({error: "Server error"});
            }
        });

    }, err => {
        console.error(err);
        if (err === "user already exists") {
            res.status(409).send({error: "User already exists"});
        } else {
            res.status(500).send({error: "Could not add user"});
        }
    });
});

// Delete Account -- Delete all notes associated with user as well
users.delete("/delete", ensureAuthentication, (req, res) => {
    if (req.session.user.userType === "admin") {
        // get User to delete notes
        getUserByEmail(req.body.email).then(user => {

            // Delete notes for this user
            deleteAllNotes(user.uuid).then(response => {
                // Delete user
                deleteUser(req.body.email).then(response => {
                    res.send("User Deleted");
                }, err => {
                    console.error(err);
                    res.status(500).send({error: "Could not delete user"});
                });
            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not delete user notes"});
            });
            
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not delete user notes"});
        });
    } else {
        // get user to delete notes
        getUserByEmail(req.session.user.email).then(user => {
            // Delete notes for this user
            deleteAllNotes(user.uuid).then(response => {

                // Logout of session
                req.logout((err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                // Delete user
                deleteUser(req.session.user.email).then(response => {
                    // Destroy session
                    req.session.destroy(err => {
                        if (err) {
                            console.error(err);
                            res.status(400).send("Unable to log out");
                        }
                    });

                    // Delete user key
                    deleteKey(user.uuid).then(response => {
                        res.status(204).send("Your account has been deleted.");
                    }, err => {
                        console.error(`Could not remove key for user: ${user.uuid} on ${new Date()}`);
                    });
                }, err => {
                    console.error(err);
                    res.status(500).send({error: "Could not delete user"});
                });
            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not delete user notes"});
            });
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not delete user notes"});
        });
    }
});

// Change Name
users.post("/changename", ensureAuthentication, (req, res) => {
    changeUserName(req.session.user.email, req.body.name).then(response => {
        res.send("Name changed");
    }, err => {
        console.error(err);
        res.status(500).send({error: "Could not change name. Please try again later"});
    });
});

// Change Password
users.post("/changepassword", ensureAuthentication, (req, res) => {
    // Check old password
    authenticate(req.session.user.email, req.body.oldPassword).then(authenticated => {
        
        // check if user is verified
        isVerified(req.session.user.email).then(result => {
            
            if (result.verified) {
                
                // Change password if user is verified
                changeUserPassword(req.session.user.email, req.body.newPassword).then(response => {
                    
                    // Send email
                    sendPasswordChangeNotification(req.session.user.email).then(success => {
                        // Send api response on success
                        res.send("Password changed");
                    }, err => {
                        res.status(500).send({error: err});
                    });

                }, err => {
                    if (err === "Passwords cannot match") {
                        res.status(400).send({error: "Your password can not be the same"});
                    } else {
                        console.error(err);
                        res.status(500).send({error: "Could not change password. Please try again later"});
                    }
                });

            } else {
                res.status(403).send({error: "You must have a verified email to change your password"});
            }

        }, err => {
            res.status(500).send({error: "Unable to check email verification status"});
        });

    }, err => {
        res.status(403).send({error: "Old password not correct"});
    });
});


// Forgot Password
users.post("/generateforgotpasswordlink", forgotPasswordLimiter, (req ,res) => {
    // Generate token
    let passwordToken = generateToken();

    if (req.body.email) {
        getUserByEmail(req.body.email).then(user => {
            // Add Token to Database and generate url
            addPasswordToken(user.uuid, passwordToken).then(url => {
                
                // Send Email
                sendForgotPasswordLink(req.body.email, url).then(success => {
                    res.status(200).send("Email sent");
                }, err => {
                    res.status(500).send({error: "Could not send email"});
                });

            }, err => {
                console.log(err);
                res.status(500).send({error: "Could not generate url"});
            });
        }, err => {
            console.error(err);
            res.status(500).send({error: "Could not get user by that email"});
        });
    }
});

users.post("/forgotpassword", forgotPasswordLimiter, (req, res) => {
    /*
        req.body.token (authentication method)
        req.body.password (new password)
    */
    if (req.body.token && req.body.password) {
        checkPasswordToken(req.body.token).then(good => {
            // token is validated and has not expired and get user
            getUserByUUID(good.user_id).then(user => {
                // change password with email
                changeUserPassword(user.email, req.body.password).then(success => {
                    // delete token
                    deletePasswordToken(good.user_id).then(good => {
                        res.status(201).send(`Password changed for user`);
                    }, err => {
                        res.status(500).send({error: "Could not delete token"});
                    });
                }, err => {
                    console.log(err);
                    switch(err) {
                        case "Passwords cannot match":
                            res.status(400).send({error: "Passwords cannot match"});
                        break;
                        default:
                            res.status(500).send({error: err});
                        break;
                    }
                });
            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not change password"});
            });
        }, err => {
            // either token does not exist or has expired. Error Handling
            if (err === "Token has expired") {
                res.status(400).send({error: "Token has expired"});
            } else if (err === "Token does not exist") {
                res.status(400).send({error: "Token does not exist"});
            } else {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            }
        });
    }
});

// Change Email
users.post("/changeemail", ensureAuthentication, (req, res) => {
    
    if (req.body.token && req.body.email) {

        // Check Token Validity
        checkEmailChangeToken(req.body.token).then(good => {

            // token is validated and not expired. Get user
            getUserByUUID(good.user_id).then(user => {

                // change email
                changeUserEmail(user.email, req.body.email).then(success => {

                    // delete token
                    deleteEmailChangeToken(user.uuid).then(good => {

                        // send email
                        sendEmailChangeNotification(user.email, req.body.email).then(good => {
                            res.status(201).send(`Email changed for user`);
                        }, err => {
                            res.status(500).send("Email Changed but could not send emails");
                        });

                    }, err => {
                        res.status(500).send({error: "Could not delete token"});
                    });

                }, err => {

                });

            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not change email"});
            });

        }, err => {
            
            // either token does not exist or has expired. Error Handling
            if (err === "Token has expired") {
                res.status(400).send({error: "Token has expired"});
            } else if (err === "Token does not exist") {
                res.status(400).send({error: "Token does not exist"});
            } else {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            }
            
        });

    }

    // do not do anything if token and email are not provided

});

users.post("/generateemailchangelink", ensureAuthentication, (req, res) => {

    isVerified(req.session.user.email).then(verified => {
        // Check if verified
        if (verified.verified) {

            // Send Email
            sendEmailChangeLink(req.session.user.email).then(success => {
                res.status(200).send(success);
            }, err => {
                
                if (err === "Could not send email") {
                    res.status(500).send({error: err});
                } else if (err === "Recipient not provided") {
                    res.status(400).send({error: err});
                } else {
                    res.status(500).send({error: "Server Error. Try Again Later"});
                }

            });

        } else {
            res.status(403).send({error: "You must have a verified email to request an email change"});
        }

    }, err => {
        res.status(400).send({error: err});
    });

});

users.post("/verifyemail", emailLimiter, (req, res) => {

    if (req.body.token) {
        checkVerificationToken(req.body.token).then(good => {
            // get user with id found with token
            getUserByUUID(good.user_id).then(user => {
                // verify email
                verifyEmail(user.email).then(response => {
                    res.status(201).send(`Email verified on ${new Date()}`);
                }, err => {
                    if (err.includes("has already verified the email")) {
                        res.status(400).send({error: "You have already verified your email!"});
                    } else if (err === "User does not exist") {
                        res.status(400).send({error: err});
                    } else {
                        res.status(500).send({error: "Server Error"});
                    }
                });
            }, err => {
                console.error(err);
                res.status(500).send({error: "Could not verify email"});
            });
        }, err => {
            if (err === "Token has expired") {
                res.status(400).send({error: "Token has expired"});
            } else if (err === "Token does not exist") {
                res.status(400).send({error: "Token does not exist"});
            } else {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            }
        });
    }
});

users.post("/generateemailverificationlink", emailLimiter, (req, res) => {
    if (req.body.email) {
        // is verified db handler
        isVerified(req.body.email).then(verified => {
            // Check if verified
            if (verified.verified) {
                res.status(204).send("User already verified");
            } else {
                sendEmailVerificationLink(req.body.email).then(success => {
                    res.status(200).send(success);
                }, err => {
                    if (err === "Could not send email") {
                        res.status(500).send({error: err});
                    } else if (err === "Recipient not provided") {
                        res.status(400).send({error: err});
                    } else {
                        res.status(500).send({error: "Server Error. Try Again Later"});
                    }
                });
            }

        }, err => {
            res.status(400).send({error: err});
        });
    } else {
        res.status(400).send({error: "Email not provided"});
    }
});

module.exports = users;