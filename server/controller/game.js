'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const settings = require('../settings')
const Game = mongoose.model('Games')
const GamePlayer = mongoose.model('GamePlayers')

exports.createGame = function(req, res, next) {
    var game = new Game(req.body)
    game.createdBy = req.decoded.id
    game.status = 'Preparing'
    return game.save()
        .then((game) => res.json(game))
        .catch((e) => error.unhandled(res, e))
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
                game.name = req.body.name;
            }
            if(req.body.configs) {
                req.body.configs.forEach(function(config) {
                    if(config.name && config.value) {
                        game.setConfig(config.name, config.value)
                    }
                })
            }
            return game.save().then((game) => res.json(game))
        })
        .catch((e) => error.unhandled(res, e))
}

exports.addPlayer = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            if(!game) {
                return error.proc(res, 400, "Unable to find game " + req.params.gameId)
            }
            var player = new GamePlayer()
            player.game = game.id
            player.user = req.decoded.id
            player.turns = game.getConfig(settings.CNAME_TURNS, settings.DEFAULT_START_TURNS)
            player.save().then((player) => res.json(player))
        })
        .catch((e) => error.unhandled(res, e))
}

exports.remPlayer = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            game.players.pull(req.decoded.id)
            return game.save().then((game) => res.json(game))
        })
        .catch((e) => error.unhandled(res, e))
}

