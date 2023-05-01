const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const Users = require('../../../models/Users');
const ErrorHandler = require('../../../errors/ErrorHandler');
const Profiles = require('../../../models/Profiles');


// @desc    User Profile
// @route   GET /api/profile/user-profile

router.get('/user-profile', auth.verifyToken, async (req, res) => {

    try {
        await Users.findById(req.user.id).then(user => {
            if (user) {
                Profiles.findOneAndUpdate({ userId: user._id }, {}, { upsert: true, new: true }).then(profile => {
                    const { name, email, phone, image } = user.toObject();
                    return res.status(200).json({
                        message: `Profile Details of ${name}`,
                        profile: {
                            name,
                            email,
                            phone,
                            image,
                            ...profile.toObject()
                        }
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
        return res.status(401).json({
            message
        })
    }

})

module.exports = router;