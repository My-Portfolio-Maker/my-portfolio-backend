const express = require('express');
const router = express.Router();
const auth = require('../../../../../middleware/auth');
const Users = require('../../../../../models/Users');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Extras = require('../../../../../models/Extras');
const Extras_Master = require('../../../../../models/Extras_Master');

const getExtras = async (_id, name, res, cb) => {
    await Extras_Master.findOneAndUpdate({ userId: _id }, {}, { upsert: true, new: true }).then(async extraMaster => {
        try {
            await extraMaster.populate({
                path: 'extras',
                match: { extraMasterId: extraMaster._id },
            }).then(extras => {
                if (cb) return cb(extras)
                return res.status(200).json({
                    message: `Extras for ${name}`,
                    data: extras
                });
            }).catch(err=>{
                const message = ErrorHandler(err)
                return res.status(400).json({
                    message
                })
            })
        }
        catch (err) {
            console.log(err)
            return res.status(200).json({
                message: `Extras for ${name}`,
                extras: []
            });
        }

    })
}

// @desc    Retrieve Extras 
// @router  GET /profile/extras

router.get('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user;
    try {
        const { _id, name } = await Users.findById(id);
        if (_id) {
            await getExtras(_id, name, res);
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

// @desc    Set Extras 
// @router  PUT /profile/extras

router.put('/', auth.verifyToken, async (req, res) => {

    const { id } = req.user;
    try {
        const { _id, name } = await Users.findById(id);
        if (_id) {
            await Extras_Master.findOneAndUpdate({ userId: _id }, {}, { upsert: true, new: true }).then(async extraMaster => {
                const extraObject = req.body;
                Object.keys(extraObject).map(async extraKey => {
                    const { _id, name } = extraObject[extraKey]
                    await Extras.findOneAndUpdate({
                        $and: [
                            { extraMasterId: extraMaster._id },
                            _id ? {
                                _id: _id
                            } : { name: name },
                        ]

                    },
                        { ...extraObject[extraKey] }, { upsert: true, new: true }).then(extra => {
                            return Extras_Master.findOneAndUpdate({ _id: extraMaster._id }, { $addToSet: { extras: extra._id } }, { new: true })
                        })

                })
                getExtras(_id, name, res, async function (extras) {
                    return res.status(200).json({
                        message: `Added Extras for ${name}`,
                        data: extras
                    })
                });
                return;
            })

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

// @desc    Delete Extras 
// @router  DELETE /profile/extras

router.delete('/delete', auth.verifyToken, async (req, res) => {

    const { extraId } = req.query;
    if (!extraId) return res.status(404).json({
        message: 'Please enter valid id'
    })
    const { id } = req.user;
    try {
        const { _id, name } = await Users.findById(id);
        if (_id) {
            const extraMaster = await Extras_Master.findOne({ userId: id })
            if (extraMaster) {
                await Extras.findOneAndDelete({ $and: [{ extraMasterId: extraMaster._id }, { _id: extraId }] }).then(async deleted => {
                    await Extras_Master.findOneAndUpdate({ _id: extraMaster._id }, { $pull: { extras: deleted._id } }, { new: true })
                    return res.status(200).json({
                        message: `Deleted ${deleted.name} for ${name}`,
                        data: deleted
                    })
                }).catch(err=>{
                    const message = ErrorHandler(err)
                    return res.status(400).json({
                        message
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


module.exports = router