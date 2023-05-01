const mongoose = require('mongoose');
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
    social: {
        facebook: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        },
        github: {
            type: String,
            default: ''
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Profiles', ProfileSchema);