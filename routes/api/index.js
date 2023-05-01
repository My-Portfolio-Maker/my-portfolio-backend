const express = require('express');
const router = express.Router()
const auth = require('../../middleware/auth');
const Users = require('../../models/Users');
const bcrypt = require('bcryptjs');
const ErrorHandler = require('../../errors/ErrorHandler');

router.use("/auth", require('./auth'));
router.use("/profile", require('./profile'));

// @desc    Change Password Route
// @router  PATCH /api/change-password

router.patch('/change-password', auth.verifyToken, async (req, res) => {
    const { old_password, new_password, user_id } = req.fields;

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