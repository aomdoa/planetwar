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
    availableLand: {
        type: Number,
        min: 0,
        default: 5000
    },
    startingPlayerConfig: {
        turns: {
            type: Number,
            min: 0,
            default: 5
        },
        money: {
            type: Number,
            min: 0,
            default: 50000
        },
        food: {
            type: Number,
            min: 0,
            default: 100
        },
        infantry: {
            type: Number,
            min: 0,
            default: 100
        },
        land: {
            type: Number,
            min: 0,
            default: 5
        }
    },
    gameConfig: {
        maxTurns: {
            type: Number,
            min: 5,
            default: 50
        },
        timeTurn: {
            type: Number,
            min: 1,
            default: 5
        }
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
