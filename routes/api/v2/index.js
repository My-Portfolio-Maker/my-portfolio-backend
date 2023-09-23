const express = require('express');
const router = express.Router()
const auth = require('../../../middleware/auth');
const Users = require('../../../models/Users');
const bcrypt = require('bcryptjs');
const ErrorHandler = require('../../../errors/ErrorHandler');

router.use("/auth", require('./auth'));
router.use("/profile", auth.verifyToken, require('./profile').router);
router.use("/skills", auth.verifyToken, require('./skills'));
router.use("/resume", auth.verifyToken, require('./resume'));
router.use('/services', auth.verifyToken, require('./services'));
router.use('/projects', auth.verifyToken, require('./projects'));


// @desc    Server API Page
// @route   GET /api/v2

router.get("/", auth.verifyToken, (_, res) => {
    res.send(`Welcome to the server, you are at the Server API Page`);
})

// @desc    Change Password Route
// @router  PATCH /api/v2/change-password

router.patch('/change-password', auth.verifyToken, async (req, res) => {
    const { old_password, new_password, user_id } = req.body;

    if (!user_id) return res.status(400).json({ error: "User ID is required" })
    if (!old_password) return res.status(400).json({ error: "Old Password is required" })
    if (!new_password) return res.status(400).json({ error: "New password is required" })

    if (old_password === new_password) {
        return res.status(400).json({ error: "New password is same as old password" });
    }

    try {
        const user = await Users.findById(user_id)

        if (user && await bcrypt.compare(old_password, user.password)) {
            const hashedPassword = new_password ? await bcrypt.hash(new_password, 12) : null
            await Users.findByIdAndUpdate(user_id, { password: hashedPassword }).then(docs => {
                return res.status(200).json({
                    message: 'Password changed successfully'
                })
            }).catch(err=>{
                const message = ErrorHandler(err)
                return res.status(400).json({
                    message
                })
            })
            return;
        }
        return res.status(401).json({
            message: "Old password is incorrect"
        })
    }
    catch (err) {
        console.log(err)
        const message = ErrorHandler(err)
        return res.status(400).send(message)
    }
})

module.exports = router