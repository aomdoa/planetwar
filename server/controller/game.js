'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const Game = mongoose.model('Games')
const GamePlayer = mongoose.model('GamePlayers')
const ValidationError = mongoose.Error.ValidationError

exports.createGame = function(req, res, next) {
    var game = new Game()
    game.name = req.body.name
    game.createdBy = req.decoded.id
    game.status = 'Preparing'
    return game.save()
        .then((game) => res.json(game))
        .catch((e) => {
            if(e instanceof ValidationError) {
                return error.proc(res, 400, e.message)
            } else {
                return error.unhandled(res, e)
            }
        })
}

exports.listGames = function(req, res, next) {
    return Game.find({status: { $ne: 'Completed'}}).lean()
        .then((games) => res.json(games))
        .catch((e) => error.unhandled(res, e))
}

exports.getGame = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            if(!game) {
                return error.proc(res, 404, "Unable to find game " + req.params.gameId)
            } else {
                return res.json(game)
            }
        }).catch((e) => error.unhandled(res, e))
}

exports.updateGame = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            if(!game) {
                return error.proc(res, 404, "Unable to find game " + req.params.gameId)
            }
            if(req.body.name) {
                game.name = req.body.name
            }
            return game.save().then((game) => res.json(game))
        })
        .catch((e) => error.unhandled(res, e))
}

exports.remGame = function(req, res, next) {
    return Game.findOneAndRemove({_id: { $eq: req.params.gameId }, createdBy: { $eq: req.decoded.id }})
        .then((game) => {
            if(!game) {
                return error.proc(res, 400, "Unable to find game to remove " + req.params.gameId)
            }
            return res.json(game)
        })
        .catch((e) => error.unhandled(res, e))
}
