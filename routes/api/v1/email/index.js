const express = require('express');
const router = express.Router();
const ErrorHandler = require('../../../../errors/ErrorHandler');
const Users = require('../../../../models/Users');


router.post('/send', async (req, res) => {

    const fields = req.body
    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(async user => {
            if (user) {
                var mailRequest = await global.transporter
                const { name, email, subject, message } = fields;
                const mailOptions = {
                    from: `"${user.name}" <${user.email}>`,
                    to: email,
                    replyTo: `"${user.name}" <${user.email}>`,
                    subject: `Thank you for contacting ${user.name}`,
                    html: `<span>Hello,</span><br/><br /><span>This mail is regarding your query to us.</span><br/><span>We will revert you back in a short while</span><br /><br/><br /><b>Name: </b><span>${name}</span><br/><br/><b>Subject: </b><span>${subject}</span><br/><br/><b>Message: </b><span>${message}</span><br/><br/><br/><span>Regards</span><br /><span>${user.name}</span>`
                }

                const mailStatus = await mailRequest.sendMail(mailOptions)
                if (mailStatus) {
                    const {messageId} = mailStatus
                    return res.status(200).json({
                        message: 'Submitted request. Please check your mail',
                        message_id: messageId
                    })
                }
            }
        })
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(400).json({
            message
        })
    }

})


module.exports = router;