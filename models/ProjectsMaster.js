const { default: mongoose, Schema } = require("mongoose");

const ProjectsMasterSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Projects',
        required: true,
        default: []
    }],
    subtitle: {
        type: String,
        default: ""
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('ProjectsMaster', ProjectsMasterSchema, 'projects_master');