const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Registration = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    consultation: {
        type: Schema.Types.ObjectId,
        ref: 'Consultation'
    },
    created: {
        type: Date,
        default: new Date()
    }
})
  
module.exports = mongoose.model('Registration', Registration)