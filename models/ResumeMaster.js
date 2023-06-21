const { default: mongoose, Schema } = require("mongoose");

const ResumeMaster = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    experiences: [{
        type: Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
        default: []
    }]
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('ResumeMaster', ResumeMaster, 'resume_master');