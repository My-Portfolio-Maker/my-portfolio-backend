const { default: mongoose, Schema } = require("mongoose");

const ServicesMasterSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },

    services: [{
        type: Schema.Types.ObjectId,
        ref: 'Services',
        required: true,
        default: []
    }],

    custom_services: [{
        type: String,
        trim: true,
        default: []
    }]
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('ServicesMaster', ServicesMasterSchema, 'services_master');