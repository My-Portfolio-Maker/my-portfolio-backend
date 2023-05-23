const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const Users = require('../../../models/Users');
const ErrorHandler = require('../../../errors/ErrorHandler');
const Profiles = require('../../../models/Profiles');
const { getAuthTokenFromHeader } = require('../../../utils');
const Skills = require('../../../models/Skills');
const SkillsMaster = require('../../../models/SkillsMaster');
const SkillData = require('../../../models/Skills/SkillData');


// @desc    Skills
// @route   GET /api/skills

router.get('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user
    try {
        const user = await Users.findById(id);
        if (user) {
            await SkillsMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(skillMaster => {
                skillMaster.populate({
                    path: 'skills',
                    match: { skillMasterId: skillMaster._id },

                    populate: {
                        path: 'skill',
                        model: 'SkillData',
                        select: { name: 1, type: 1 },
                    },
                    select: { skillId: 1, score: 1},
                }).then(skills => {
                    const {userId, _id, ...skillInfo} = skills.toObject()
                    return res.status(200).json({
                        message: `Skills of ${user.name}`,
                        ...skillInfo,
                    })
                })
            })
        }
        // res.sendStatus(200);
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

// @desc    Add Skills
// @route   POST /api/skills/add

router.post("/add", auth.verifyToken, async (req, res) => {
    const { id } = req.user

    try {
        const user = await Users.findById(id);
        if (user) {
            await SkillsMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(skillMaster => {
                const skillsObject = req.fields
                Object.keys(skillsObject).map(async skillKey => {
                    await SkillData.findOneAndUpdate({ name: skillKey }, {}, { upsert: true, new: true }).then(skill => {
                        Skills.findOneAndUpdate({ $and: [{ skillMasterId: skillMaster._id }, { skillId: skill._id }] }, { score: skillsObject[skillKey] }, { upsert: true, new: true }).then(skill => {
                            return SkillsMaster.findOneAndUpdate({ _id: skillMaster._id }, { $addToSet: { skills: skill._id } }, { new: true })
                        })
                    })
                })
                return res.status(200).json({
                    message: `Added skills for ${user.name}`
                })
            }).catch(err => {
                return res.status(400).json({
                    message: 'Error adding skills'
                })
            })
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

// @desc    Update Skill by ID
// @route   PUT /api/skills/update?id=

router.put("/update", auth.verifyToken, async (req, res)=>{
    const {scoreId} = req.query;
    const {score} = req.fields;

    

    if(!score) return res.status(404).json({message: 'Please provide new score in percentage'})
    try {
        const user = await Users.findById(req.user.id);
        if(user){
            const {_id} = await SkillsMaster.findOne({userId: user.id})
            await Skills.findOneAndUpdate({$and: [{ _id: scoreId }, {skillMasterId: _id} ]}, {score}, {new: true}).then(skill=>{
                skill.populate({
                    path: 'skill',
                    model: 'SkillData',
                    select: { name: 1, type: 1 },
                }).then(info=>{
                    const {skillMasterId, ...skillInfo} = info.toObject()
                    return res.status(200).json({
                        message: `Updated Skill Score for ${info.skill.name}`,
                        data: skillInfo
                    })
                })
            }).catch(_=>{
                return res.status(403).json({
                    message: 'Error updating skill'
                })
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