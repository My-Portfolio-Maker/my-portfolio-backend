const express = require('express');
const ErrorHandler = require('../../../../../../errors/ErrorHandler');
const router = express.Router()
var mime = require('mime-types');
const Users = require('../../../../../../models/Users');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

router.get('/:name/download', async (req, res) => {

    const { name: fileName } = req.params
    const { uid, type } = req.query

    try {
        const user = await Users.findById(uid)
        if (user) {
            const { name } = user.toObject()
            const fileExtension = mime.extension(type);
            const ar = name.split(' ').join('_');

            const displayFileName = `${ar}_Resume${fileExtension ? `.${fileExtension}` : ''}`

            const s3 = await global.s3;

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `cv/${fileName}`
            })

            try {
                const response = await s3.send(command)
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

router.get('/:name/view', async (req, res) => {
    const { name: fileName } = req.params;
    const { uid, type } = req.query

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

                const data = await response.Body.transformToString('base64')
                if (!data) return res.status(404).set('Content-Type', 'text/plain').send(`File not found`);
                var img = Buffer.from(data, 'base64');
                res.writeHead(200, {
                    'Content-Type': type,
                    'Content-Length': img.length
                })
                res.end(img, 'base64')
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