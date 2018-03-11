'use strict'

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const emailValidator = require('mongoose-type-email')

const Schema = mongoose.Schema

var UserSchema = new Schema({
    name: {
        type: String,
        required: 'Username is required',
        unique: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: 'Email is required',
        unique: true
    },
    password: {
        type: String,
        required: 'Password is required'
    }
})
UserSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Users', UserSchema);
