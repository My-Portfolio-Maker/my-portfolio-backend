const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Users = require('../../../../../models/Users');
const Extras_Master = require('../../../../../models/Extras_Master');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(user => {
            if (user) {
                const { name } = user;
                Extras_Master.findOne({ userId: uid }).then(async extraMaster => {
                    try {
                        await extraMaster.populate({
                            path: 'extras',
                            match: { extraMasterId: extraMaster._id },
                        }).then(extras => {

                            return res.status(200).json({
                                message: `Extras for ${name}`,
                                data: extras
                            });
                        })
                    }
                    catch (err) {
                        console.log(err)
                        return res.status(200).json({
                            message: `Extras for ${name}`,
                            extras: []
                        });
                    }

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

