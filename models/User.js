const mongoose = require('mongoose')
const Schema = mongoose.Schema
var User = new Schema({
    googleId: {
        type: String,
    },
    mail: {
        type: String
    },
    name: {
        type: String
    },
    role: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String
    },
})
  
module.exports = mongoose.model('User', User)