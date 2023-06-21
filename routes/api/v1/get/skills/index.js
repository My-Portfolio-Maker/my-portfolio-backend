const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Profiles = require('../../../../../models/Profiles');
const Users = require('../../../../../models/Users');
const SkillsMaster = require('../../../../../models/SkillsMaster');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(user => {
            if (user) {
                SkillsMaster.findOne({ userId: user._id }).then(skillMaster => {
                    skillMaster.populate({
                        path: 'skills',
                        match: { skillMasterId: skillMaster._id },

                        populate: {
                            path: 'skill',
                            model: 'SkillData',
                            select: { name: 1, type: 1 },
                        },
                        select: { skillId: 1, score: 1 },
                    }).then(skills => {
                        const { userId, _id, ...skillInfo } = skills.toObject()
                        return res.status(200).json({
                            message: `Skills of ${user.name}`,
                            ...skillInfo,
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