const { default: mongoose, Schema } = require("mongoose");

const ResumeSchema = new mongoose.Schema({

    resumeMasterId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ResumeMaster'
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
        default: Date.now,
        required: true,
    },
    cwh_flag: {
        type: Boolean,
        default: false,
        required: true
    },
    end_date: {
        type: Date,
        default: Date.now,
        required: function(){
            return !this.cwh_flag
        }
    }
},{
    versionKey: false,
    timestamps: true
})

module.exports = mongoose.model('Resume', ResumeSchema);