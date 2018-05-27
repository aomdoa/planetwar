'use strict'

const mongoose = require('mongoose')
const GpStateSchema = require('./gp_state')

const Schema = mongoose.Schema

var GamePlayerSchema = new Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Games',
        required: 'Game reference is required for the game player'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: 'User reference is required for the game player'
    },
    joinedOn: {
        type: Date,
        default: Date.now
    },
    turns: {
        type: Number,
        min: 0,
        default: 1
    },
    state: GpStateSchema
})

GamePlayerSchema.pre('validate', function(next) {
    if(this.isModified('joinedOn')) {
        this.invalidate('joinedOn')
    }
    next()
})

module.exports = mongoose.model('GamePlayers', GamePlayerSchema)
