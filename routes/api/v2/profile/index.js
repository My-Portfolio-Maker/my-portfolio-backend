const express = require('express');
const router = express.Router();
const auth = require('../../../../middleware/auth');
const Users = require('../../../../models/Users');
const ErrorHandler = require('../../../../errors/ErrorHandler');
const Profiles = require('../../../../models/Profiles');
const { getAuthTokenFromHeader } = require('../../../../utils');
const SocialConstants = require('../../../../constants/Socials');
const { default: mongoose, mongo } = require('mongoose');

router.use('/extras', auth.verifyToken, require('./Extras'));

const profileHandler = async (res, userInfo, profile, update = false) => {
    const { name, email, phone, avatar } = userInfo.toObject();
    await profile.populate({
        path: 'cv',
        model: 'CV',
        select: { name: 1, type: 1, _id: 1 }
    }).then(profile => {
        const { _id, userId, social, cv, ...rest } = profile.toObject()
        return res.status(200).json({
            message: `Profile ${update ? 'Updated' : 'Details'} for ${name}`,
            profile: {
                _id,
                userId,
                name,
                email,
                phone,
                avatar,
                ...rest,
                social,
                cv
            }
        })
    })
}

// @desc    User Profile
// @route   GET /api/profile/user-profile

router.get('/user-profile', auth.verifyToken, async (req, res) => {

    try {
        await Users.findById(req.user.id).then(user => {
            if (user) {
                user.populate({
                    path: 'avatar',
                    model: 'Uploads',
                    select: { name: 1, type: 1 }
                }).then(async user => {
                    await Profiles.findOneAndUpdate({ userId: user._id }, {}, { upsert: true, new: true }).then(async profile => {

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
            const { name, email, phone, avatar, ...profileInfo } = req.body;
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (avatar) user.avatar = avatar;
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
            userInfo.populate({
                path: 'avatar',
                model: 'Uploads',
                select: { name: 1, type: 1 }
            }).then(async user => {
                await Profiles.findOneAndUpdate({ userId: id }, { ...profileInfo }, { new: true, upsert: true }).then(async profile => {
                    await profileHandler(res, user, profile, true)
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

module.exports = {
    router,
    profileHandler
};