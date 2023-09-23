const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Users = require('../../../../../models/Users');
const ProjectsMaster = require('../../../../../models/ProjectsMaster');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;

    try {
        await Users.findById(uid).then(async user => {
            if (user) {
                await ProjectsMaster.findOne({ userId: uid }).then(projectMaster => {
                    projectMaster.populate({
                        path: 'projects',
                        populate: {
                            path: 'images',
                            model: 'Uploads',
                            select: {name:1, type: 1}
                        }
                    }).then(projects => {
                        const { _id, createdAt,updatedAt, subtitle, ...rest } = projects.toObject()
                        return res.status(200).json({
                            message: `Projects for ${user.name}`,
                            data: {
                                ...rest,
                                subtitle,
                                createdAt,
                                updatedAt
                            }
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