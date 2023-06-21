const express = require('express');
const router = express.Router()
const auth = require('../../middleware/auth');
const Users = require('../../models/Users');
const formData = require('../../middleware/formData');
const uploadFile = require('../../middleware/upload');


router.use('/v3', auth.verifyToken, require('./v3')); // Only for Upload APIs

router.use('/v2', formData, require('./v2'))
router.use('/v1', require('./v1'))
// @desc    Welcome Page with authentication
// @route   GET /welcome

router.get('/welcome', auth.verifyToken, async (req, res) => {
    const loggedInUser = await Users.findOne({ _id: req.user.id });
    if(loggedInUser)
        return res.status(200).send(`Welcome ${loggedInUser.name}, you are authenticated`)
    return res.status(404).json({
        message: "User doesn't exists"
    })
})

module.exports = router