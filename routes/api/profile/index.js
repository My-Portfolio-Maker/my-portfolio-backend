const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const Users = require('../../../models/Users');
const ErrorHandler = require('../../../errors/ErrorHandler');
const Profiles = require('../../../models/Profiles');
const { getAuthTokenFromHeader } = require('../../../utils');
const SocialConstants = require('../../../constants/Socials');

router.use('/extras', auth.verifyToken, require('./Extras'));


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
                            ...profile.toObject(),
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


// @desc    Set User Profile by Token
// @route   PUT /api/profile/user-profile

router.put('/user-profile', auth.verifyToken, async (req, res) => {

    const { id } = req.user

    try {
        const user = await Users.findById(id);
        if (user) {
            const { name, email, phone, image, ...profileInfo } = req.fields;
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (image) user.image = image;
            const userInfo = await user.save();

            let social = {};
            Object.keys(SocialConstants).map(items => {
                social = {
                    ...social,
                    [items]: profileInfo[items]
                }
                delete profileInfo[items]
            })
            profileInfo['social'] = social

            await Profiles.findOneAndUpdate({ userId: id }, profileInfo, { new: true, upsert: true }).then(profile => {
                const { name, email, phone, image } = userInfo.toObject();
                return res.status(200).json({
                    message: `Profile Updated for ${name}`,
                    profile: {
                        name,
                        email,
                        phone,
                        image,
                        ...profile.toObject(),
                    }
                })
            })
            return;
        }
        else {
            return res.status(404).json({
                message: "User doesn't exists"
            })
        }

    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

module.exports = router;