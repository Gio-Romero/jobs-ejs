const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    profilename: {
        type: String,
        required: [true, 'Please provide profile name'],
        maxlength: 50
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100
    },
    age: {
        type: Number,
        required: [true, 'Please provide age'],
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, { timestamps: true })

module.exports = mongoose.model('Profile', ProfileSchema)