'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const settings = require('../settings')
const Game = mongoose.model('Games')
const GamePlayer = mongoose.model('GamePlayers')
const ValidationError = mongoose.Error.ValidationError

function processConfigs(game, req) {
    if(req.body.configs && req.body.configs.length > 0) {
        req.body.configs.forEach(function(config) {
            if(config.name && config.value && settings.GAME_CONFIGS.indexOf(config.name) > -1) {
                game.setConfig(config.name, config.value)
            }
        })
    }
}

exports.createGame = function(req, res, next) {
    var game = new Game()
    game.name = req.body.name
    game.createdBy = req.decoded.id
    game.status = 'Preparing'
    game.configs = settings.DEFAULT_GAME_CONFIGS
    processConfigs(game, req)
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
            processConfigs(game, req)
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
