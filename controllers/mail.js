'use strict';

const Mailjet = require('node-mailjet');

function sendForgotPasswordMail (user, host, resetLink) {
    const mailjet = Mailjet.apiConnect(
        process.env.MJ_APIKEY_PUBLIC,
        process.env.MJ_APIKEY_PRIVATE,
    );
    
    const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
              Messages: [
                {
                  From: {
                    Email: "leanhuynh2002@gmail.com",
                    Name: "Eshop"
                  },
                  To: [
                    {
                      Email: user.email,
                      Name: `${user.firstName} ${user.lastName}`
                    }
                  ],
                  Subject: "[Esho] Reset Password",
                  HTMLPart: `
                  <p></p>Hi ${user.firstName} ${user.lastName},</p>
                  <br/>
                  <p>You recently requested to reset the password for your ${host} account. Click the button below to proceed.</p>
                  <br/>
                  <p><a href="${resetLink}">Rest password</a></p>
                  <br/>
                  <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset link is only valid for the next 30 minutes.</p>
                  <br/>
                  <p>Thanks,</p> 
                  <p>Eshop</p>`
                }
              ]
            });
    return request;
}

module.exports = {sendForgotPasswordMail};