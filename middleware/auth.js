const jwt = require("jsonwebtoken");
const Sessions = require("../models/Sessions");
const Users = require("../models/Users");
const Profiles = require("../models/Profiles");
const ErrorHandler = require("../errors/ErrorHandler");

const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    const token = bearerHeader && bearerHeader.split(" ")[1];

    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        const { id, sessionId } = jwt.decode(token)
        await Sessions.findOne({ $and: [{ userID: id }, { sessionID: sessionId }] }).then(async session => {
            if (session.logoutSession) {
                const sessionDestroy = await Sessions.deleteOne({ _id: session._id })
                if (sessionDestroy.acknowledged) {
                    await Users.findOneAndUpdate({ _id: id }, {
                        $pull: { session: session._id }
                    }, { new: true });
                }
                return res.status(401).send("Access denied. Invalid token.")
            }
            try {
                jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                    if (err) return res.status(401).send("Access denied. Invalid token.");
                    req.user = user;
                    console.log("Authenticated")
                    return next();
                })
            }
            catch (err) {
                return res.status(401).send(err);
            }
        })

    }
    catch (err) {
        return res.status(401).send("Access denied. Invalid token.");
    }
}

const verifyUID = async (req, res, next) => {
    const { uid } = req.headers;
    
    if (!uid) return res.status(401).send("Access denied. No UID provided.");

    try {
        await Users.findById(uid).then(user => {
            if (user)
                return next();
            return res.status(404).json({
                message: "User doesn't exists"
            })
        })
    }
    catch (err) {
        const message = ErrorHandler(err);
        return res.status(401).json({
            message
        })
    }
}

module.exports = { verifyToken, verifyUID }