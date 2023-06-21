const express = require('express');
const router = express.Router();
const auth = require('../../../../middleware/auth')
const Users = require('../../../../models/Users');
const ErrorHandler = require('../../../../errors/ErrorHandler');
const CV = require('../../../../models/CV');
const Profiles = require('../../../../models/Profiles');
const upload = require('../../../../middleware/upload');
const Uploads = require('../../../../models/Uploads');

//  @desc       Upload CV
//  @router     PUT /api/v3/upload/cv

router.put('/cv', upload.SingleFile, async (req, res) => {

    const { id } = req.user;

    if (req.file.size === 0 || !req.file || Object.keys(req.file).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    try {

        const user = await Users.findById(id);
        if (user) {
            const profile = await Profiles.findOne({ userId: user._id })
            if (profile) {
                const { filename, mimetype } = req.file;
                const { _id } = profile;
                await CV.findOneAndUpdate({ profileId: _id }, { name: filename, type: mimetype }, { upsert: true, new: true }).then(cv => {
                    const { profileId, createdAt, updatedAt, ...rest } = cv.toObject();
                    return res.status(200).json({
                        message: `CV uploaded successfully ${user.name}`,
                        file: {
                            ...rest,
                            createdAt,
                            updatedAt
                        }
                    })
                })
                return;
            }
        }
        return res.status(404).json({
            message: "User doesn't exists"
        })
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
})

//  @desc       Upload Image/Images
//  @router     PUT /api/v3/upload/images

router.post('/images', upload.MultipleImageFiles, async (req, res) => {

    const { id } = req.user;
    if (req.files.size === 0 || !req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    try {

        const user = await Users.findById(id);
        if (user) {
            const profile = await Profiles.findOne({ userId: user._id })
            if (profile) {
                const {files} = req
                const { _id } = profile;
                await Promise.all(files.map(async item=>{
                    const {filename, mimetype} = item;
                    return await Uploads.create({ profileId: _id, name: filename, type: mimetype })
                })).then(uploaded=>{
                    const filterData = uploaded.map(item=>{
                        const {profileId, _id, ...rest} = item.toObject();
                        return {
                            _id,
                            ...rest
                        }
                    })
                    return res.status(200).json({
                        message: `${filterData.length === 1?'Image':'Images'} uploaded successfully for ${user.name}`,
                        data: filterData
                    })
                })
                
                return;
            }
        }
        return res.status(404).json({
            message: "User doesn't exists"
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