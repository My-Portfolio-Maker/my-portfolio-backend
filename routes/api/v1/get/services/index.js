const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Users = require('../../../../../models/Users');
const ServicesMaster = require('../../../../../models/ServicesMaster');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(async user => {
            if (user) {
                await ServicesMaster.findOne({ userId: uid }).then(serviceMaster => {
                    serviceMaster.populate({
                        path: 'services',
                    }).then(services => {
                        const { _id, ...rest } = services.toObject()
                        return res.status(200).json({
                            message: `Service Names for ${user.name}`,
                            data: rest
                        })
                    })
                })
                return;
            }
            return res.status(404).json({
                message: "User doesn't exists"
            })
        })
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(400).json({
            message
        })
    }
})

module.exports = router