const { default: mongoose } = require("mongoose");

const SessionSchema = new mongoose.Schema({

    userID: {
        type: String,
        required: true,
    },
    sessionID: {
        type: String,
        required: true,
    },
    expires: {
        type: Number,
        required: true,
    },
    logoutSession:{
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Sessions', SessionSchema);