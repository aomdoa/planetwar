'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const settings = require('../settings')
const Game = mongoose.model('Games')
const GamePlayer = mongoose.model('GamePlayers')

exports.listPlayers = function(req, res, next) {
    return GamePlayer.find({game: { $eq: req.params.gameId }}).populate('user', 'name')
        .then((players) => {
            var gamePlayers = players.map((player) => {
                return {
                    _id: player._id,
                    joinedOn: player.joinedOn,
                    land: player.resources.land,
                    name: player.user.name
                }
            })
            res.json(gamePlayers)
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
    return GamePlayer.findOneAndRemove({game: { $eq: req.params.gameId}, user: { $eq: req.decoded.id }})
        .then((player) => {
            if(!player) {
                return error.proc(res, 400, "Unable to find player in game " + req.params.gameId)
            }
            return res.json(player)
        })
        .catch((e) => error.unhandled(res, e))
}

