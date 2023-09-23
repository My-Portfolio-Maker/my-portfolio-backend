const express = require('express');
const router = express.Router();
const auth = require('../../../../middleware/auth');
const Users = require('../../../../models/Users');
const ServicesMaster = require('../../../../models/ServicesMaster');
const Services = require('../../../../models/Services');
const ErrorHandler = require('../../../../errors/ErrorHandler');
const ProjectsMaster = require('../../../../models/ProjectsMaster');
const Projects = require('../../../../models/Projects');
const { verifyUploads, verifyUploadsHandler } = require('../../utilities');

// @desc    Projects
// @route   GET /api/v2/projects

router.get('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user;
    try {
        const user = await Users.findById(id);
        if (user) {
            await ProjectsMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(projectMaster => {
                projectMaster.populate({
                    path: 'projects',
                    options: { sort: { 'createdAt': -1 } },
                    populate: {

                        path: 'images',
                        model: 'Uploads',
                        select: { name: 1, type: 1 }

                    }
                }).then(projects => {
                    const { _id, subtitle, updatedAt, ...rest } = projects.toObject()
                    return res.status(200).json({
                        message: `Project Names for ${user.name}`,
                        data: {
                            ...rest,
                            subtitle,
                            updatedAt
                        }
                    })
                }).catch(_ => {
                    return res.status(200).json({
                        message: `No projects for ${user.name}`,
                    })
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

// @desc    Add Projects
// @route   POST /api/v2/projects/add

router.post("/add", auth.verifyToken, async (req, res) => {
    const { id } = req.user

    const { name, type, ...rest } = req.body;

    if (!name) res.status(400).send({ error: "Project name is required" })
    if (!type) res.status(400).send({ error: "Project type is required" })

    try {
        const user = await Users.findById(id);
        if (user) {
            await ProjectsMaster.findOne({ userId: user._id }).then(async _ => {
                const projectsObject = req.body
                const newProject = await Projects.create({
                    ...projectsObject
                }).then(async project => {
                    project.populate({
                        path: 'images',
                        model: 'Uploads',
                        select: { name: 1, type: 1 }
                    })
                    const { _id } = project
                    try {
                        await ProjectsMaster.findOneAndUpdate({ userId: id }, { $addToSet: { projects: _id } }, { upsert: true, new: true })
                        return project
                    }
                    catch (_) {
                        await Projects.findByIdAndDelete(project._id)
                    }
                })

                const { _id, ...rest } = newProject.toObject()
                return res.status(200).json({
                    message: `Added project for ${user.name}`,
                    data: {
                        _id,
                        ...rest
                    }
                })


            }).catch(_ => {
                return res.status(400).json({
                    message: 'Error adding project'
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

// @desc    Update Project by ID (only admin use)
// @route   PUT /api/projects/update?id=

router.put("/update", auth.verifyToken, async (req, res) => {
    const { id } = req.query;

    const { name, type, ...projectInfo } = req.body;

    if (!name) return res.status(404).json({ message: 'Please provide new project name' })
    if (!type) return res.status(404).json({ message: 'Please provide project type' })

    try {
        const user = await Users.findById(req.user.id);
        if (user) {

            await ProjectsMaster.findOne({ $and: [{ userId: user._id }, { projects: { "$in": [id] } }] }).then(async _ => {
                if (projectInfo?.images?.length) {
                    projectInfo.images = [...await verifyUploadsHandler(projectInfo.images, user._id)]
                }
                await Projects.findByIdAndUpdate(id, { name, type, ...projectInfo }, { new: true }).populate({
                    path: 'images',
                    model: 'Uploads',
                    select: { name: 1, type: 1 }
                }).then(project => {
                    return res.status(200).json({
                        message: `Updated Project for ${user.name}`,
                        data: project.toObject()
                    })
                }).catch(_ => {
                    return res.status(403).json({
                        message: 'Error updating project info'
                    })
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


// @desc    Delete Project by ID
// @route   DELETE /api/skills/delete?id=

router.delete("/delete", auth.verifyToken, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(404).json({
        message: 'Please enter valid project id'
    })

    try {
        const user = await Users.findById(req.user?.id);
        const fn = async (string) => {
            await ProjectsMaster.findOneAndUpdate({
                $and: [{ userId: user._id }, {
                    projects: {
                        "$in": [string]
                    }
                }]
            }, { $pull: { projects: string } }, { new: true }).then(async newProject => {
                await Projects.findByIdAndDelete(string)
                await newProject.populate({
                    path: 'projects',

                }).then(info => {
                    const { _id, ...rest } = info.toObject()
                    return res.status(200).json({
                        message: `Updated projects for ${user.name}`,
                        data: { ...rest }
                    })
                })

            }).catch(_ => {
                return res.status(404).json({
                    message: `Project id - ${id} not found`
                })
            })
        }
        if (user._id) {
            await fn(id)
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