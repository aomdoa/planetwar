'use strict'

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

var GameSchema = new Schema({
    name: {
        type: String,
        required: 'Game name is required',
        unique: true
    },
    status: {
        type: String,
        required: 'State is required',
        enum: ['Preparing', 'Active', 'Finishing', 'Done']
    },
    createdOn: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'User reference is required for the game'
    }
})

GameSchema.pre('save', function(next) {
    if(!this.createdOn) {
        this.createdOn = new Date()
    }
    next()
})

GameSchema.pre('validate', function(next) {
    if(this.isModified('createdOn')) {
        this.invalidate('createdOn')
    }
    next()
})

GameSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Games', GameSchema);
