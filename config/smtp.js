const nodemailer = require("nodemailer");

const connectSMTP = async (service) => {
    try {
        console.log('Connecting to SMTP Server')
        const transporter = nodemailer.createTransport({
            service,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: process.env.USER_MAILID,
                pass: process.env.USER_MAILPASS
            }
        })
        const status = await transporter.verify()
        if (status) {
            console.log('Connected to SMTP Service');
        }
        return transporter
    }
    catch (err) {
        console.log('Error in connecting to SMTP Server')
    }
}

module.exports = connectSMTP