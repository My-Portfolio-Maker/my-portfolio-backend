const mongoose = require('mongoose');
const SocialConstants = require('../constants/Socials');
const Schema = mongoose.Schema;


const ProfileSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: { unique: true, dropDups: true }
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
    address: {
        type: String,
        default: ''
    },
    pincode: {
        type: Number,
        default: null
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
    }

},{
    versionKey: false,
    timestamps: true,
})

module.exports = mongoose.model('Profiles', ProfileSchema);