const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Profiles = require('../../../../../models/Profiles');
const Users = require('../../../../../models/Users');
const { profileHandler } = require('../../../v2/profile');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(user => {
            if (user) {
                user.populate({
                    path: 'avatar',
                    model: 'Uploads',
                    select: { name: 1, type: 1 }
                }).then(async user => {
                    await Profiles.findOne({ userId: user._id }).then(async profile => {
                        await profileHandler(res, user, profile)
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