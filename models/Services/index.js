const { default: mongoose } = require("mongoose");

const ServicesSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
   
    type: {
        type: String,
        required: true,
        default: 'Others'
    }
}, {
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Services', ServicesSchema, 'services');