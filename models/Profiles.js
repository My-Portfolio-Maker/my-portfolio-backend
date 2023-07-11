const mongoose = require('mongoose');
const SocialConstants = require('../constants/Socials');
const Schema = mongoose.Schema;


const ProfileSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: { unique: true }
    },
    gender: {
        type: String,
        default: ''
    },
    date_of_birth: {
        type: Date,
        trim: true,
        default: null
    },
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Uploads',
        default: []
    }],
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        default: null
    },
    field: {
        type: String,
        required: true
    },
    aboutMe: {
        type: String,
        default: ''
    },
    designation: {
        type: String,
        default: ''
    },
    social: SocialConstants,

    project_completed: {
        type: String,
        default: ''
    },
    cv: {
        type: Schema.Types.ObjectId,
        ref: 'CV',
    }

}, {
    versionKey: false,
    timestamps: true,
})

module.exports = mongoose.model('Profiles', ProfileSchema);