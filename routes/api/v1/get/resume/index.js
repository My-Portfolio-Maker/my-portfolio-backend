const express = require('express');
const ErrorHandler = require('../../../../../errors/ErrorHandler');
const Users = require('../../../../../models/Users');
const ResumeMaster = require('../../../../../models/ResumeMaster');
const router = express.Router()

router.get('/', async (req, res) => {

    const { uid } = req.headers;
    let {type} = req.query

    if(!type) {
        type = 'all'
    }
    const getType = ()=>{
        if(type === 'all')
            return ''
        else 
            return {type}
    }

    try {
        await Users.findById(uid).then(user => {
            if (user) {
                const { name } = user;
                ResumeMaster.findOne({ userId: uid }).then(resumeMaster => {
                    const { _id } = resumeMaster
                    resumeMaster.populate({
                        path: 'experiences',
                        match: { resumeMasterId: _id, ...getType() },
                        select: { createdAt: 0, updatedAt: 0, resumeMasterId: 0, cwh_flag: 0 }
                    }).then(resume => {
                        return res.status(200).json({
                            message: `${type==='experience'?'Experience':type==='all'?'All Resume':'Education'} details for ${name}`,
                            data: resume
    
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

