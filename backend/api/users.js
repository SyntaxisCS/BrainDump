// Express
const express = require("express");
const {rateLimit, MemoryStore} = require("express-rate-limit");

// Passport
const passport = require("passport");

// Router initialization
const users = express.Router();

// Email
const nodeMailer = require("nodemailer");

// Database Handlers
const {getUserByUUID, getUserByEmail, getAllUsers, createUser, deleteUser, changeUserName, changeUserEmail, changeUserPassword, deleteAllNotes, deleteKey, addPasswordToken, getPasswordToken, checkPasswordToken, deletePasswordToken, authenticate} = require("./database/dbHandler");

// Helpers
const {generateUUID} = require("../Utils/uuidGenerator");
const { generateToken } = require("../Utils/nanoIdGenerator");

// Email Transporter
let transporter = nodeMailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'gia.konopelski6@ethereal.email',
        pass: 'mp7XDyP1t422agt4g7'
    }
});

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
        dateJoined: date
    };

    // Database
    createUser(userObject).then(success => {
        userObject.password = "server redacted";
        res.status(201).send(userObject);
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
        
        // Change password
        changeUserPassword(req.session.user.email, req.body.newPassword).then(response => {
            res.send("Password changed");
        }, err => {
            if (err === "Passwords cannot match") {
                res.status(400).send({error: "Your password can not be the same"});
            } else {
                console.error(err);
                res.status(500).send({error: "Could not change password. Please try again later"});
            }
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
            addToken(user.uuid, passwordToken).then(url => {
                // create email options
                const mailOptions = {
                    from: "gladyce.hahn@ethereal.email",
                    to: req.body.email,
                    subject: "Your BrainDump password reset link has arrived!",
                    html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0">A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" valign="top" style="padding:36px 24px"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td bgcolor="#ffffff" align="left"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"><tr><td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Reset Your Password</h1><p style="margin:0">Click the button below to reset your account password. If you did not make this request you can safely delete this email. Receiving a request does not mean someone has access to your account.</p></td></tr><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#2952c4" style="border-radius:6px"><a href="${url}" target="_blank" style="display:inline-block;padding:16px 36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px">Password Reset</a></td></tr></table></td></tr></table></td></tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><p style="margin:0">If that doesn't work, copy and paste the following link in your browser:</p><p style="margin:0">${url}</p></td></tr></table></td></tr></table></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"><p style="margin:0"><br>BrainDump</p></td></tr></table><tr><td align="center" bgcolor="#040506" style="padding:24px"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">You received this email because a password request was made for this email. If you did not make this request then you can safely delete this email. Receiving a password request does not mean someone has access to your account.</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">braindump.net</p></td></tr></table></td></tr></body>`
                };

                // Send Email
                transporter.sendMail(mailOptions).then(info => {
                    res.status(200).send("Email sent");
                }, err => {
                    console.error(err);
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
                res.status().send({error: "Token has expired"});
            } else if (err === "Token does not exist") {
                res.status().send({error: "Token does not exist"});
            } else {
                console.error(err);
                res.status(500).send({error: "Server Error"});
            }
        });
    }
});

// Change Email
users.post("/changeemail", ensureAuthentication, (req, res) => {
    changeUserEmail(req.session.user.email, req.body.newEmail).then(response => {
        res.send("Email changed");
    }, err => {
        if (err === "Emails cannot match") {
            res.status(400).send({error: "Your email can not be the same"});
        } else {
            res.status(500).send({error: "Could not change email. Please try again later"});
        }
    });
});

user.post("/verifyemail", emailLimiter, (req, res) => {
    /* req.body.token */

    if (req.body.token) {
        
    }
});

module.exports = users;