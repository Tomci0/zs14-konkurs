const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Consultation = new Schema({
    subject: {
        type: String,
    },
    hours: {
        type: String
    },
    building: {
        type: String
    },
    classroom: {
        type: String
    },
    teacher: {
        type: String
    },
    date: {
        type: Date
    },
    maxMembers: {
        type: Number,
        default: 32
    },
    description: {
        type: String,
        default: ''
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: new Date()
    }
})
  
module.exports = mongoose.model('Consultation', Consultation)