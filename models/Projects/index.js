const { default: mongoose, Schema } = require("mongoose");

const ProjectsSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null
    },

    src: {
        type: String,
        default: null
    },

    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Uploads',
        default: []
    }],

    type: {
        type: String,
        required: true,
        default: 'Others'
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Projects', ProjectsSchema, 'projects');