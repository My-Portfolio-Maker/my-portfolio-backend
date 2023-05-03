const mongoose = require('mongoose');
const Schema = mongoose.Schema

const SkillsSchema = new mongoose.Schema({
    skillMasterId: {
        type: String,
        required: true,
    },
    skillId: {
        type: Schema.Types.ObjectId,
    },
    score: {
        type: String,
        default: '0%',
        required: true
    }
}, {
    timestamps: true,
})

SkillsSchema.virtual("skill", {
    ref: 'SkillData',
    localField: 'skillId',
    foreignField: '_id',
    justOne: true
})

SkillsSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret.id
        delete ret.skillId
    }
})

SkillsSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret.id
        delete ret.skillId
    }
})

module.exports = mongoose.model('Skills', SkillsSchema);