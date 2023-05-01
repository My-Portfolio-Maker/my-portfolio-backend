const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Users = require('../models/Users');


// @desc    Server Landing Page
// @route   GET /

router.get("/", (req, res) => {
    res.send(`Welcome to the server, you are at the Server Home Page`);
    console.log(req.url)
})

// @desc    Server API Page
// @route   GET /api

router.get("/api", auth.verifyToken, (req, res) => {

    res.send(`Welcome to the server, you are at the Server API Page`);

})

// @desc Welcome Page with authentication
// @route GET /welcome

router.get('/success', auth.verifyToken, async (req, res) => {

    const loggedInUser = await Users.findOne({ _id: req.user.id });
    if(loggedInUser)
    // console.log(req)
        return res.status(200).send(`Welcome ${loggedInUser.name}, you are authenticated`)
    return res.status(404).json({
        message: "User doesn't exists"
    })
})

module.exports = router;