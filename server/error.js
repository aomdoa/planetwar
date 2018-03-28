'use strict'

const winston = require('winston');
const mongoose = require('mongoose')

exports.proc = function(res, code, message) {
    res.status(code).json({msg: message})
}

exports.unhandled = function(res, err) {
    winston.log('error', err)
    if (err instanceof mongoose.Error.CastError) {
        res.status(400).json({ msg: 'Object does not exist' })
    } else {
        res.status(500).json({ msg: 'Something is broken, it has been logged'} )
    }
}

