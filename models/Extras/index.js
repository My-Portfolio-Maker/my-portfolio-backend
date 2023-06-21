const express = require('express');
const { default: mongoose, Schema } = require('mongoose');
const router = express.Router();

const ExtrasSchema = new mongoose.Schema({
    extraMasterId: {
        type: Schema.Types.ObjectId,
        ref: 'ExtrasMaster',
        required: true,
        
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
},{
    timestamps: true,
    versionKey: false
})

// SkillsSchema.virtual("skill", {
//     ref: 'SkillData',
//     localField: 'skillId',
//     foreignField: '_id',
//     justOne: true
// })

ExtrasSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    timestamps: false,
    transform: (_doc, ret) => {
        delete ret.extraMasterId
        delete ret.id
    }
})

ExtrasSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    timestamps: false,
    transform: (_doc, ret) => {
        delete ret.extraMasterId
        delete ret.id
    }
})

module.exports = mongoose.model('Extras', ExtrasSchema)