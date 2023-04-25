const express = require('express');
const Users = require('../models/Users');
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth')
const ErrorHandler = require('../errors/ErrorHandler');
const Sessions = require('../models/Sessions');
const JWT_CONFIG = require('../config/jwt');

// @desc    Server API Register Page
// @route   GET /api/register

router.post("/register", async (req, res) => {

    try {

        console.log(req.fields)

        const { name, email, phone, image, password } = req.fields;

        if (!email) res.status(400).send({ error: "Email is required" })
        if (!password) res.status(400).send({ error: "Password is required" })
        if (!name) res.status(400).send({ error: "Name is required" })

        let oldUser = await Users.findOne({ email })
        if (oldUser) {
            return res.status(409).send({
                message: "User already exists"
            })

        }
        const hashedPassword = password ? await bcrypt.hash(password, 12) : null

        const registeredUser = await Users.create({
            name,
            email: email.toLowerCase(),
            phone,
            image,
            password: hashedPassword
        }).then(user => {
            const { password, ...userInfo } = user.toObject()
            return userInfo
        })

        const token = jwt.sign(
            { id: registeredUser._id, email, name },
            process.env.JWT_SECRET, {
            expiresIn: JWT_CONFIG.JWT_EXPIRE
        })

        return res.status(201).json({
            message: "User created successfully",
            user: registeredUser,
            token: token
        })
    }
    catch (err) {
        console.log(err)
        const message = ErrorHandler(err)
        console.log(message)
        return res.status(400).send(message)


    }
})

// @desc    Server API Login Page
// @route   GET /api/login

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.fields
        if (!email) return res.status(400).json({ error: "Email is required" })
        if (!password) return res.status(400).json({ error: "Password is required" })

        const user = await Users.findOne({ email })

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, sessionId: req.sessionID, email, name: user.name },
                process.env.JWT_SECRET, {
                expiresIn: JWT_CONFIG.JWT_EXPIRE
            })

            const { id, exp } = jwt.decode(token);

            await Sessions.findOneAndUpdate({ $and: [{ sessionID: req.sessionID }, { userID: id }] }, {
                expires: exp,
                logoutSession: false
            }, { upsert: true, new: true }).then(session => {
                return Users.findOneAndUpdate({ _id: id }, { "$push": { session: session._id } }, { new: true })
            }).then(user => {
                user.populate({
                    path: 'session',
                    match: { sessionID: req.sessionID }
                }).then(user => {
                    const { password, ...userInfo } = user.toObject()
                    return res.status(200).json({
                        message: "User logged in successfully",
                        user: userInfo,
                        access_token: token
                    })
                })
            })
            return;
        }
        return res.status(404).json({
            message: "Invalid Credentials"
        })
    }
    catch (err) {
        console.log(err)
        const message = ErrorHandler(err)
        console.log(message)
        return res.status(400).send(message)


    }
})

// @desc    Server API Reauthorize Token
// @route   GET /api/refresh_auth

router.post("/refresh_auth", auth, async (req, res) => {
    try {
        console.log(req);
    }
    catch (err) {
        res.status(400).send(err);
        throw err
    }
})

// @desc    Server API Logout
// @route   GET /api/logout

router.put("/logout", auth, async (req, res) => {
    try {
        const bearerToken = req.headers.authorization.split(" ")[1];

        const { id, sessionId } = jwt.decode(bearerToken);

        await Sessions.findOneAndUpdate({ $and: [{ userID: id }, { sessionID: sessionId }] }, {
            logoutSession: true
        }, { new: true }).then(session => {
            if (session) {
                return res.status(200).json({
                    message: "User logged out successfully",
                    user: session.user
                })
            }
            return;
        });
    }
    catch (err) {
        const message = ErrorHandler(err)
        console.log(message)
        return res.status(400).send(message)
    }
})


module.exports = router