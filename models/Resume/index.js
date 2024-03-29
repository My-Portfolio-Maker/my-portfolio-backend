const { default: mongoose, Schema } = require("mongoose");

const ResumeSchema = new mongoose.Schema({

    resumeMasterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ResumeMaster'
    },
    order: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        default: '',
        required: true
    },
    designation: {
        type: String,
        default: '',
        required: true
    },
    description: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
        required: true
    },
    start_date: {
        type: Date,
        default: null,
        required: true,
    },
    cwh_flag: {
        type: Boolean,
        default: false,
        required: true
    },
    end_date: {
        type: Date,
        default: null,
        required: function(){
            return this.cwh_flag === false
        }
    },
    type: {
        type: String,
        required: true
    }
},{
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Resume', ResumeSchema);