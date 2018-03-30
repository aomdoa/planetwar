'use strict'

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const _ = require('lodash')

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
        ref: 'Users',
        required: 'User reference is required for the game'
    },
    configs: [{
        name: String,
        value: String
    }]
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

GameSchema.methods.setConfig = function(name, value) {
    var config = _.find(this.configs, ['name', name])
    if(config) {
        config.value = value
    } else {
        this.configs.push({name: name, value: value})
    }
}

GameSchema.methods.getConfig = function(name, defaultValue) {
    var config = _.find(this.configs, ['name', name])                                                                
    if(config) {
        return config.value
    } else {
        return defaultValue
    }
}

GameSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Games', GameSchema);
