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

router.get("/api", auth, (req, res) => {

    res.send(`Welcome to the server, you are at the Server API Page`);

})

// @desc Welcome Page with authentication
// @route GET /welcome

router.get('/success', auth, async (req, res) => {

    const loggedInUser = await Users.findOne({ _id: req.user.id });
    console.log(req)
    return res.status(200).send(`Welcome ${loggedInUser.name}, you are authenticated`)
})

module.exports = router;