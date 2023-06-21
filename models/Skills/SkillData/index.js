const mongoose = require('mongoose');
const Schema = mongoose.Schema

const SkillDataSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        default: 'Others'
    },
}, {
    versionKey: false,
    timestamps: true,
})


module.exports = mongoose.model('SkillData', SkillDataSchema, 'skill_data')