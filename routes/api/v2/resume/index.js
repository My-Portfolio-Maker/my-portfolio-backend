const express = require('express')
const router = express.Router()
const auth = require('../../../../middleware/auth');
const Users = require('../../../../models/Users');
const ErrorHandler = require('../../../../errors/ErrorHandler');
const Resume = require('../../../../models/Resume');
const moment = require('moment');
const ResumeMaster = require('../../../../models/ResumeMaster');
const { resolveDateFormat } = require('../../../../utils');

// @desc       Add Experience Details
// @route      POST /api/resume/add

router.post('/add', auth.verifyToken, async (req, res) => {
    const { id } = req.user;

    try {
        const user = await Users.findById(id);
        if (user) {
            const { _id, name } = user

            const { start_date, end_date, ...rest } = req.body
            if (!rest.cwh_flag) return res.status(400).send("Cwh flag is required")
            if (!end_date && rest.cwh_flag == 'false') return res.status(400).send("End date is required");

            const data = {
                userId: _id,
                start_date: moment(start_date, 'DD/MM/YYYY'),
                ...rest
            }
            if (end_date && !rest.cwh_flag)
                data['end_date'] = moment(end_date, 'DD/MM/YYYY');

            await ResumeMaster.findOneAndUpdate({ userId: _id }, {}, { upsert: true, new: true }).then(async resumeMaster => {
                if (resumeMaster) {
                    const { _id } = resumeMaster
                    try {
                        const masterData = {
                            resumeMasterId: _id,
                            ...data
                        }
                        const resume = new Resume(masterData);
                        await resume.save().then(({ resumeMasterId, _id }) => {
                            return ResumeMaster.findByIdAndUpdate(resumeMasterId, { $addToSet: { experiences: _id } }, { new: true })
                        }).then(resumeMaster => {
                            resumeMaster.populate({
                                path: 'experiences',
                                match: { _id: resume._id },
                                select: { createdAt: 0, updatedAt: 0, resumeMasterId: 0 },

                            }).then(info => {
                                const { experiences, _id, updatedAt, ...rest } = info.toObject()
                                return res.status(200).json({
                                    message: `Added Experience for ${name}`,
                                    data: {
                                        ...rest,
                                        experiences: experiences.map(exp => exp)[0],
                                        updatedAt
                                    }
                                })
                            })

                        })
                    }
                    catch (err) {
                        const message = ErrorHandler(err);
                        return res.status(401).send(message);
                    }
                }
            })
        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).send(message);
    }
})

// @desc       Get All Experience Details
// @route      GET /api/resume

router.get('/', auth.verifyToken, async (req, res) => {
    const { id, name } = req.user;

    try {
        const user = await Users.findById(id);
        if (user) {
            await ResumeMaster.findOneAndUpdate({ userId: id }, {}, { upsert: true, new: true }).then(resumeMaster => {
                const { _id } = resumeMaster
                resumeMaster.populate({
                    path: 'experiences',
                    match: { resumeMasterId: _id },
                    select: { createdAt: 0, updatedAt: 0, resumeMasterId: 0, cwh_flag: 0 }
                }).then(resume => {
                    return res.status(200).json({
                        message: `Experience details for ${name}`,
                        data: resume

                    })
                })
            })

        }
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).send(message);
    }
})

// @desc       Update Experience By Id
// @route      PUT /api/resume/update?id=

router.put('/update', auth.verifyToken, async (req, res) => {
    const { id } = req.query;

    try {
        const { user } = req
        const { _id, name } = await Users.findById(user.id);
        if (_id) {
            await ResumeMaster.findOne({ userId: _id }).then(async resumeMaster => {
                const { _id } = resumeMaster
                const { start_date, end_date, ...rest } = req.body

                if (!rest.cwh_flag) return res.status(400).send("Cwh flag is required")
                if (!end_date && rest.cwh_flag === 'false') return res.status(400).send("End date is required");

                const newData = {
                    ...rest,
                    start_date: resolveDateFormat(start_date),
                }
                if (end_date && rest.cwh_flag === 'false')
                    newData['end_date'] = resolveDateFormat(end_date)
                else newData['end_date'] = resolveDateFormat()

                await Resume.findOneAndUpdate({
                    $and: [{
                        resumeMasterId: _id
                    }, {
                        _id: id
                    }]
                }, newData, { new: true }).then(newResume => {
                    const { resumeMasterId, ...rest } = newResume.toObject()
                    return res.status(200).json({
                        message: `Experience details updated for ${name}`,
                        data: rest
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


// @desc       Delete Experience By Id
// @route      DELETE /api/resume/delete?id=

router.delete('/delete', auth.verifyToken, async (req, res) => {
    const { id } = req.query;
    try {
        const { user } = req
        const { _id, name } = await Users.findById(user.id);
        if (_id) {
            await ResumeMaster.findOne({ userId: _id }).then(async resumeMaster => {
                const { _id } = resumeMaster;
                await Resume.findOneAndDelete({ $and: [{ resumeMasterId: _id }, { _id: id }] }).then(async deleted => {
                    await ResumeMaster.findOneAndUpdate({ _id: _id }, { $pull: { experiences: deleted._id } }, { new: true });
                    const { resumeMasterId, ...rest } = deleted.toObject()
                    return res.status(200).json({
                        message: `Experience details for ${name} deleted successfully`,
                        data: rest
                    })
                })

            }).catch(_ => {
                return res.status(404).json({
                    message: "No Experience found"
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