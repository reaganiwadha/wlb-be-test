const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    service:  'Mailgun',
    auth : {
        user : process.env.MAILGUN_SMTP_USER,
        pass : process.env.MAILGUN_SMTP_PASSWORD
    }
})
