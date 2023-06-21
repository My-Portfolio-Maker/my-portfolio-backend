const { default: mongoose, Schema, mongo } = require("mongoose");

const CvSchema = new mongoose.Schema({

    profileId: {
        type: Schema.Types.ObjectId,
        ref: 'Profiles',
        required: true,
        index: {
            unique: true
        }
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('CV', CvSchema);