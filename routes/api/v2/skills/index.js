const express = require('express');
const router = express.Router();
const auth = require('../../../../middleware/auth');
const Users = require('../../../../models/Users');
const ErrorHandler = require('../../../../errors/ErrorHandler');
const Profiles = require('../../../../models/Profiles');
const { getAuthTokenFromHeader } = require('../../../../utils');
const Skills = require('../../../../models/Skills');
const SkillsMaster = require('../../../../models/SkillsMaster');
const SkillData = require('../../../../models/Skills/SkillData');


const getSkills = async (id, res, user, cb) => {
    await SkillsMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(skillMaster => {
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
            const { userId, _id, title, ...skillInfo } = skills.toObject()
            if (cb) return cb(skillInfo)
            else {
                return res.status(200).json({
                    message: `Skills of ${user.name}`,
                    data: {
                        _id,
                        userId,
                        title,
                        ...skillInfo,
                    }
                })
            }

        })
    }).catch(err=>{
        const message = ErrorHandler(err)
        return res.status(400).json({
            message
        })
    })
}

// @desc    Skills
// @route   GET /api/skills

router.get('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user
    try {
        const user = await Users.findById(id);
        if (user) {
            getSkills(id, res, user)
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
            await SkillsMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(async skillMaster => {
                const skillsObject = req.body
                await Promise.all(Object.keys(skillsObject).map(async skillKey => {
                    await SkillData.findOneAndUpdate({ name: skillKey }, {}, { upsert: true, new: true }).then(async skill => {
                        await Skills.findOneAndUpdate({ $and: [{ skillMasterId: skillMaster._id }, { skillId: skill._id }] }, { score: skillsObject[skillKey] }, { upsert: true, new: true }).then(skill => {
                            return SkillsMaster.findOneAndUpdate({ _id: skillMaster._id }, { $addToSet: { skills: skill._id } }, { new: true })
                        })
                    })
                    return skillKey
                })).then(async _ => {
                    await getSkills(id, _, user, (response) => {
                        return res.status(200).json({
                            message: `Added skills for ${user.name}`,
                            ...response
                        })
                    })
                })
            }).catch(_ => {
                return res.status(400).json({
                    message: 'Error adding skills'
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

// @desc    Update Skill by ID
// @route   PUT /api/skills/update?id=

router.put("/update", auth.verifyToken, async (req, res) => {
    const { scoreId } = req.query;
    const { score } = req.body;



    if (!score) return res.status(404).json({ message: 'Please provide new score in percentage' })
    try {
        const user = await Users.findById(req.user.id);
        if (user) {
            const { _id } = await SkillsMaster.findOne({ userId: user.id })

            await Skills.findOneAndUpdate({ $and: [{ _id: scoreId }, { skillMasterId: _id }] }, { score }, { new: true }).then(skill => {

                skill.populate({
                    path: 'skill',
                    model: 'SkillData',
                    select: { name: 1, type: 1 },
                }).then(info => {
                    const { skillMasterId, createdAt, updatedAt, ...skillInfo } = info.toObject()
                    return res.status(200).json({
                        message: `Updated Skill Score for ${info.skill.name}`,
                        data: {
                            ...skillInfo,
                            createdAt,
                            updatedAt
                        }
                    })
                })
            }).catch(_ => {
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

// @desc    Delete Skill by ID
// @route   DELETE /api/skills/delete?id=

router.delete("/delete", auth.verifyToken, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(404).json({
        message: 'Please enter valid id'
    })

    try {
        const { _id, name } = await Users.findById(req.user?.id);

        if (_id) {
            const skillMaster = await SkillsMaster.findOne({ userId: _id })

            if (skillMaster) {
                const { _id } = skillMaster
                await Skills.findOneAndDelete({ $and: [{ skillMasterId: _id }, { _id: id }] }).then(async deleted => {
                    await SkillsMaster.findOneAndUpdate({ _id: _id }, { $pull: { skills: deleted._id } }, { new: true })
                    deleted.populate({
                        path: 'skill',
                        model: 'SkillData',
                        select: { name: 1, type: 1 },
                    }).then(info => {
                        const { skill, skillMasterId, ...remain } = info.toObject()
                        return res.status(200).json({
                            message: `Deleted ${skill.name} skill for ${name}`,
                            data: { ...remain, skill }
                        })
                    })

                }).catch(_ => {
                    return res.status(404).json({
                        message: 'Skill not found'
                    })
                })
            }
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
    return;
})

module.exports = router;