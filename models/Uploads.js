const { default: mongoose, Schema, mongo } = require("mongoose");

const UploadsSchema = new mongoose.Schema({

    profileId: {
        type: Schema.Types.ObjectId,
        ref: 'Profiles',
        required: true,
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

module.exports = mongoose.model('Uploads', UploadsSchema);