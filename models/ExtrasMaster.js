const { default: mongoose, Schema } = require("mongoose");

const ExtrasMasterSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    extras: [{
        type: Schema.Types.ObjectId,
        ref: 'Extras',
        required: true,
        default: [],
    }]
},
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = mongoose.model('ExtrasMaster', ExtrasMasterSchema, 'extras_master')