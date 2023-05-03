const mongoose = require('mongoose');
const Schema = mongoose.Schema

const SkillsMasterSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
        index: { unique: true, dropDups: true }
    },
    profileId: {
        type: Schema.Types.ObjectId,
        ref: 'Profiles',
        required: true,
        index: { unique: true, dropDups: true }
    },
    title: {
        type: String,
        default: '',
    },
    skills: [{
        type: Schema.Types.ObjectId,
        ref: "Skills",
        required: true,
        default: [],
        index: { unique: true, dropDups: true }
    }],
},{
    versionKey: false,
    timestamps: true,
})

module.exports = mongoose.model('SkillsMaster', SkillsMasterSchema, 'skills_master');