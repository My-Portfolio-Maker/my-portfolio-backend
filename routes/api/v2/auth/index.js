const express = require('express');
const Users = require('../../../../models/Users');
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const auth = require('../../../../middleware/auth')
const ErrorHandler = require('../../../../errors/ErrorHandler');
const Sessions = require('../../../../models/Sessions');
const JWT_CONFIG = require('../../../../config/jwt');

// @desc    Server API Register Page
// @route   GET /api/auth/register

router.post("/register", async (req, res) => {

    try {

        console.log(req.body)

        const { name, email, phone, avatar, password } = req.body;

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
            avatar,
            password: hashedPassword
        }).then(user => {
            const { password, ...userInfo } = user.toObject()
            return userInfo
        })

        return res.status(201).json({
            message: "User created successfully",
            user: registeredUser,
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
// @route   GET /api/auth/login

router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body
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
                logoutSession: false,
            }, { upsert: true, new: true }).then(session => {
                return Users.findOneAndUpdate({ _id: id }, { $addToSet: { session: session._id } }, { new: true })
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
        return res.status(401).json({
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
// @route   GET /api/auth/refresh_auth

router.post("/refresh_auth", auth.verifyToken, async (req, res) => {
    try {
        console.log(req);
    }
    catch (err) {
        res.status(400).send(err);
        throw err
    }
})

// @desc    Server API Logout
// @route   GET /api/auth/logout

router.delete("/logout", auth.verifyToken, async (req, res) => {
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