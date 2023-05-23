const mongoose = require('mongoose')
const { isEmail } = require('validator')
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
        required: [true, 'Please enter your name'],
        type: String
    },
    phone: {
        minlength: 10,
        type: Number,
        default: null
    },
    email: {
        required: [true, 'Please enter an email'],
        type: String,
        unique: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        required: [true, 'Please enter a password'],
        type: String,
        minlength: [6, 'Password must be at least 6 characters']
    },
    image: {
        type: String,
        default: ''
    },
    session: [{
        type: Schema.Types.ObjectId,
        ref: "Sessions",
        required: true,
        default: [],
    }],

}, {
    versionKey: false,
    timestamps: true,
})

module.exports = mongoose.model('Users', UserSchema)