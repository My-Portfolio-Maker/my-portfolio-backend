const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const path = require('path');
const router = express.Router()
var mime = require('mime-types');
const { __basedir } = require('../../../../../server.js');
const Users = require('../../../../../models/Users');

router.get('/:name/download', async (req, res) => {

    const { name: fileName } = req.params
    const { uid, type } = req.query

    try {
        const user = await Users.findById(uid)
        if (user) {
            const { name } = user.toObject()
            const fileExtension = mime.extension(type);
            const ar = name.split(' ').join('_');

            const displayFileName = `${ar}_Resume.${fileExtension}`
            const filePath = path.join(__basedir, 'uploads/cv', `${fileName}`)

            res.download(filePath, displayFileName, function (err) {
                if (err) {
                    const { statusCode, code } = err
                    let message = 'Download error -'
                    switch (code) {
                        case 'ENOENT':
                            return res.status(statusCode).set('Content-Type', 'text/plain').send(`${message} no such file or directory`);
                        default:
                            return res.status(statusCode).set('Content-Type', 'text/plain').send(message)
                    }

                }
            })
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