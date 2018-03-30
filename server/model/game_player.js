'use strict'

const mongoose = require('mongoose')

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
        type: Date
    },
    turns: {
        type: Number,
        min: 0
    },
    resources: {
        money: {
            type: Number,
            min: 0
        },
        land: {
            type: Number,
            min: 0
        },
        food: {
            type: Number,
            min: 0
        }
    },
    buildings: {
        cities: {
            type: Number,
            min: 0
        },
        farms: {
            type: Number,
            min: 0
        },
        industry: {
            type: Number,
            min: 0
        }
    },
    army: {
        infantry: {
            type: Number,
            min: 0
        },
        tanks: {
            type: Number,
            min: 0
        },
        jets: {
            type: Number,
            min: 0
        },
        bombers: {
            type: Number,
            min: 0
        },
        turrets: {
            type: Number,
            min: 0
        }
    }
})

GamePlayerSchema.pre('save', function(next) {
    if(!this.joinedOn) {
        this.joinedOn = new Date()
    }
    next()
})

GamePlayerSchema.pre('validate', function(next) {
    if(this.isModified('joinedOn')) {
        this.invalidate('joinedOn')
    }
    next()
})

module.exports = mongoose.model('GamePlayers', GamePlayerSchema)
