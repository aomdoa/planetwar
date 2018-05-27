'use strict'

const mongoose = require('mongoose')
const GpStateSchema = require('./gp_state')

const Schema = mongoose.Schema

var TurnSchema = new Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players',
        required: 'Player reference is required for turn'
    },
    actionType: {
        type: String,
        required: 'Action is required',
        enum: ['expand', 'build', 'attack']
    },
    executedOn: {
        type: Date,
        default: Date.now
    },
    action: GpStateSchema,
    result: GpStateSchema
})

TurnSchema.pre('validate', function(next) {
    if(this.isModified('executedOn')) {
        this.invalidate('executedOn')
    }
    next()
})

module.exports = mongoose.model('Turns', TurnSchema)
