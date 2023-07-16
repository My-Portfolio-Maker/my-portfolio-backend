const express = require('express');
const ErrorHandler = require('../../../../../../errors/ErrorHandler');
const router = express.Router()
var mime = require('mime-types');
const Users = require('../../../../../../models/Users');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

router.get('/:name/download', async (req, res) => {

    const { name: fileName } = req.params
    const { uid } = req.query

    try {
        const user = await Users.findById(uid)
        if (user) {

            const s3 = await global.s3;

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `cv/${fileName}`
            })

            try {
                const { name } = user.toObject()

                const ar = name.split(' ').join('_');
                const response = await s3.send(command)
                const fileExtension = mime.extension(response.ContentType);
                const displayFileName = `${ar}_Resume${fileExtension ? `.${fileExtension}` : ''}`

                if (!response) return res.status(404).set('Content-Type', 'text/plain').send(`File not found`);

                res.attachment(displayFileName);
                response.Body.pipe(res);
            }
            catch (err) {
                const message = ErrorHandler(err);
                return res.status(400).json({
                    message
                })
            }

        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(400).json({
            message
        })
    }


})

router.get('/:name', async (req, res) => {
    const { name: fileName } = req.params;
    const { uid } = req.query

    try {
        const user = await Users.findById(uid)
        if (user) {

            const s3 = await global.s3;

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `images/${fileName}`
            })

            try {
                const response = await s3.send(command)
                if (!response) return res.status(404).set('Content-Type', 'text/plain').send(`File not found`);
                res.writeHead(200, {
                    'Content-Type': response.ContentType,
                })
                response.Body.pipe(res);
            }
            catch (err) {
                const message = ErrorHandler(err);
                return res.status(400).json({
                    message
                })
            }
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(400).json({
            message
        })
    }
})

module.exports = router