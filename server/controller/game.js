'use strict'
const mongoose = require('mongoose')
const Game = mongoose.model('Games')

exports.userGames = function(req, res, next) {
}

exports.joinGame = function(req, res, next) {
}

exports.createGame = function(req, res, next) {
    var game = new Game(req.body)
    game.createdBy = req.decoded.id
    game.status = 'Preparing'
    return game.save()
        .then((game) => res.json(game))
        .catch((e) => res.json(e))
}

exports.listGames = function(req, res, next) {
   return Game.find({status: { $ne: 'Completed'}}).lean()
        .then((games) => res.json(games))
        .catch((e) => res.json(e))
}

exports.getGame = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => res.json(game))
        .catch((e) => res.json(e))
}

exports.updateGame = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
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
            return game.save()
                .then((game) => res.json(game))
                .catch((e) => res.json(e))
        })
        .catch((e) => res.json(e))
}

exports.addPlayer = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            if(game.players.indexOf(req.decoded.id) == -1) {
                game.players.push(req.decoded.id)
                return game.save()
                    .then((game) => res.json(game))
                    .catch((e) => res.json(e))
            } else {
                res.json(game)
            }
        })
        .catch((e) => res.json(e))
}

exports.remPlayer = function(req, res, next) {
    return Game.findById(req.params.gameId)
        .then((game) => {
            game.players.pull(req.decoded.id)
            return game.save()
                .then((game) => res.json(game))
                .catch((e) => res.json(e))
        })
        .catch((e) => res.json(e))
}

