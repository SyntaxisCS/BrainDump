const nodeMailer = require("nodemailer");
const fs = require("fs");

// helper functions
const { generateToken } = require("../../Utils/nanoIdGenerator");
const { getUserByEmail, addVerificationToken, addEmailChangeToken } = require("../database/dbHandler");

const emailSender = "kellen67@ethereal.email";
let transporter = nodeMailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: emailSender, // CHANGE THIS FOR PRODUCTION AND DEVELOPMENT
        pass: 'MPwRwdJ3qEyU8qXz3V'
    }
});

// Send Account Creation Notification
const sendAccountCreationNotification = async (recipient) => {
    return new Promise((resolve, reject) => {
        if (recipient) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Thanks for joining BrainDump",
                html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0">A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" valign="top" style="padding:36px 24px"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td bgcolor="#ffffff" align="left"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"><tr><td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Thanks for joining us!</h1><p style="margin:0">Thank you for creating a Braindump account! We hope that our tool to quickly create securely encrypted notes proves to be very useful for you. We have sent an email verification email to you as well so please keep an eye out for it!</p></td></tr></table></td></tr></table><tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"><p style="margin:0"><br>BrainDump</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:24px"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">You recieved this request because someone created a BrainDump account with this email. If this was not you please {contact us}</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">braindump.net</p></td></tr></table></td></tr></body>`
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });

        } else {
            reject("Recipient not provided");
        }
    });
};

// Password Change Notification
const sendPasswordChangeNotification = async (recipient) => {
    return new Promise((resolve, reject) => {
        if (recipient) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Your BrainDump Password has been successfully changed",
                html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0"></div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" valign="top" style="padding:36px 24px"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td bgcolor="#ffffff" align="left"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"><tr><td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Password Successfully Changed!</h1><p style="margin:0">Your account password has been successfully changed. If this was you, you can safely delete this email. If this was not you, please click the button below to change your password</p></td></tr><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#2952c4" style="border-radius:6px"><a href="http://localhost:9801/forgotpassword" target="_blank" style="display:inline-block;padding:16px 36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px">Change Password</a></td></tr></table></td></tr></table></td></tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><p style="margin:0">If that doesn't work, copy and paste the following link in your browser:</p><p style="margin:0">http://localhost:9801/forgotpassword</p></td></tr></table></td></tr></table></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"><p style="margin:0"><br>BrainDump</p></td></tr></table><tr><td align="center" bgcolor="#040506" style="padding:24px"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">You received this email because your account password has been changed. If this was you, you can safely delete this email. If this was not you, please change your password using our forgot password form.</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">braindump.net</p></td></tr></table></td></tr></body>`
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });

        } else {
            reject("Recipient not provided");
        }
    }); 
};

const sendEmailChangeNotification = async (oldrecipient, newrecipient) => {
    return new Promise((resolve, reject) => {

        if (oldrecipient && newrecipient) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: newrecipient, // to new email
                cc: oldrecipient, // carbon copy old email
                subject: "Your BrainDump Email has been successfully changed",
                html: ``
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Emails sent");
            }, err => {
                console.error(err);
                reject("Could not send emails");
            });

        } else {
            reject("Recipients not provided");
        }

    });
};

// Send Forgot Password Link
const sendForgotPasswordLink = async (recipient, url) => {
    return new Promise((resolve, reject) => {
        if (recipient && url) {

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Your BrainDump password reset link has arrived!",
                html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0">A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" valign="top" style="padding:36px 24px"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td bgcolor="#ffffff" align="left"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"><tr><td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Reset Your Password</h1><p style="margin:0">Click the button below to reset your account password. If you did not make this request you can safely delete this email. Receiving a request does not mean someone has access to your account.</p></td></tr><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#2952c4" style="border-radius:6px"><a href="${url}" target="_blank" style="display:inline-block;padding:16px 36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px">Password Reset</a></td></tr></table></td></tr></table></td></tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><p style="margin:0">If that doesn't work, copy and paste the following link in your browser:</p><p style="margin:0">${url}</p></td></tr></table></td></tr></table></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"><p style="margin:0"><br>BrainDump</p></td></tr></table><tr><td align="center" bgcolor="#040506" style="padding:24px"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">You received this email because a password request was made for this email. If you did not make this request then you can safely delete this email. Receiving a password request does not mean someone has access to your account.</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">braindump.net</p></td></tr></table></td></tr></body>`
            };

            // Send Email
            transporter.sendMail(mailOptions).then(info => {
                resolve("Email sent");
            }, err => {
                console.error(err);
                reject("Could not send email");
            });

        } else {
            reject("Recipient or url not provided");
        }
    });
};

// Send Email Verification Link
const sendEmailVerificationLink = async (recipient) => {
    return new Promise((resolve, reject) => {
        let verificationToken = generateToken();

        if (recipient) {
            getUserByEmail(recipient).then(user => {
                addVerificationToken(user.uuid, verificationToken).then(url => {
                    
                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: recipient,
                        subject: "Please Verify your BrainDump email!",
                        html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"> <div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0">A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"> <tr> <td align="center" bgcolor="#040506"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"> <tr> <td align="center" valign="top" style="padding:36px 24px"></td></tr></table> </td></tr><tr> <td align="center" bgcolor="#040506"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"> <tr> <td bgcolor="#ffffff" align="left"></td></tr></table> </td></tr><tr> <td align="center" bgcolor="#040506"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"> <tr> <td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"> <h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Verify your email!</h1> <p style="margin:0">Click the button below to verify your email.</p></td></tr><tr> <td align="left" bgcolor="#ffffff"> <table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td align="center" bgcolor="#ffffff" style="padding:12px"> <table border="0" cellpadding="0" cellspacing="0"> <tr> <td align="left" bgcolor="#ffffff"> <table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td align="center" bgcolor="#ffffff" style="padding:12px"> <table border="0" cellpadding="0" cellspacing="0"> <tr> <td align="center" bgcolor="#2952c4" style="border-radius:6px"> <a href="${url}" target="_blank" style="display:inline-block;padding:16px 36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px">Verify</a> </td></tr></table> </td></tr></table> </td></tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"> <p style="margin:0">If that doesn't work, copy and paste the following link in your browser:</p><p style="margin:0">${url}</p></td></tr></table> </td></tr></table> </td></tr><tr> <td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"> <p style="margin:0"> <br>BrainDump </p></td></tr></table> <tr> <td align="center" bgcolor="#040506" style="padding:24px"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"> <tr> <td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"> <p style="margin:0">You received this email because you created an account with us using this email. If you did not do this, please go{contact us}HYPERLINK to remove your email from our records.</p></td></tr><tr> <td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"> <p style="margin:0">braindump.net</p></td></tr></table> </td></tr></body>`
                    };

                    // Send Email
                    transporter.sendMail(mailOptions).then(info => {
                        resolve(`Email sent to ${recipient}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    });

                }, err => {
                    reject(err);
                });
            }, err => {
                reject(err);
            });
        } else {
            reject("Recipient not provided");
        }
    });
};

const sendEmailChangeLink = async (recipient) => {
    return new Promise((resolve, reject) => {

        // Check if recipient is provided
        if (recipient) {
        
            // Generate Token
            let token = generateToken();

            getUserByEmail(recipient).then(user => {

                addEmailChangeToken(user.uuid, token).then(url => {

                    // Create Email Options
                    const mailOptions = {
                        from: emailSender,
                        to: recipient,
                        subject: "BrainDump Email Change Request",
                        html: `<body style="background-color:#040506;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%"><div class="preheader" style="display:none;max-width:0;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#040506;opacity:0">A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%" style="mso-table-rspace:0;mso-table-lspace:0"><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" valign="top" style="padding:36px 24px"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td bgcolor="#ffffff" align="left"></td></tr></table></td></tr><tr><td align="center" bgcolor="#040506"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;mso-table-rspace:0;mso-table-lspace:0"><tr><td bgcolor="#ffffff" align="left" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><h1 style="margin:0 0 12px;font-size:32px;font-weight:400;line-height:48px">Change your Email</h1><p style="margin:0">Click the button below to change your account email. If you did not make this request please change your password.</p></td></tr><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding:12px"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#2952c4" style="border-radius:6px"><a href="${url}" target="_blank" style="display:inline-block;padding:16px 36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;color:#fff;text-decoration:none;border-radius:6px">Change Email</a></td></tr></table></td></tr></table></td></tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px"><p style="margin:0">If that doesn't work, copy and paste the following link in your browser:</p><p style="margin:0">${url}</p></td></tr></table></td></tr></table></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding:24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:16px;line-height:24px;border-bottom:3px solid #d4dadf"><p style="margin:0"><br>BrainDump</p></td></tr></table><tr><td align="center" bgcolor="#040506" style="padding:24px"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px"><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">You received this email because a email change request was made for this email. If you did not request this, please change your password.</p></td></tr><tr><td align="center" bgcolor="#040506" style="padding:12px 24px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:14px;line-height:20px;color:#666"><p style="margin:0">braindump.net</p></td></tr></table></td></tr></body>`
                    };

                    // Send Email
                    transporter.sendMail(mailOptions).then(info => {
                        resolve(`Email Change Email sent to ${recipient}`);
                    }, err => {
                        console.error(err);
                        reject("Could not send email");
                    });

                }, err => {
                    reject(err);
                });

            }, err => {
                reject(err);
            });


        } else {
            reject("Recipient not provided");
        }

    });
};

const sendAccountData = async (recipient, filePath) => {
    return new Promise((resolve, reject) => {

        // check if recipient and file path is provided
        if (recipient && filePath) {

            // get file
            const zipFile = fs.readFileSync(filePath);

            // Create Email Options
            const mailOptions = {
                from: emailSender,
                to: recipient,
                subject: "Here is all the data we have that is associated with your account...",
                html: ``,
                attachments: [
                    {
                        filename: "account_data.zip",
                        content: zipFile,
                        contentType: "application/zip"
                    }
                ]
            };

            transporter.sendMail(mailOptions).then(info => {
                // Delete zip file
                fs.rmSync(filePath);

                resolve(`Account data email sent to ${recipient} at ${new Date()}`);
            }, err => {
                console.error(err);
                reject("Could not send email");
            });

        } else {
            reject("Recipient or file path not provided");
        }

    });
};

module.exports = {
    sendAccountCreationNotification,
    sendPasswordChangeNotification,
    sendEmailChangeNotification,
    sendForgotPasswordLink,
    sendEmailVerificationLink,
    sendEmailChangeLink,
    sendAccountData
};