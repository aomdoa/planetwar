'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const settings = require('../settings')
const Game = mongoose.model('Games')
const GamePlayer = mongoose.model('GamePlayers')

exports.listPlayers = function(req, res, next) {
    console.log('list')
    return GamePlayer.find({game: { $eq: req.params.gameId } }).populate('user', 'name')
        .then((players) => {
            var gamePlayers = players.map((player) => {
                return {
                    _id: player._id,
                    joinedOn: player.joinedOn,
                    land: (player.resources.land) ? player.resources.land : 0,
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
            player.turns = game.getConfig(settings.CNAME_START_TURNS, settings.DEFAULT_START_TURNS)
            player.resources.money = game.getConfig(settings.CNAME_START_MONEY, settings.DEFAULT_START_MONEY)
            player.resources.food = game.getConfig(settings.CNAME_START_FOOD, settings.DEFAULT_START_FOOD)
            player.resources.land = game.getConfig(settings.CNAME_START_LAND, settings.DEFAULT_START_LAND)
            player.army.infantry = game.getConfig(settings.CNAME_START_INFANTRY, settings.DEFAULT_START_INFANTRY)
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

exports.getPlayer = function(req, res, next) {
    return GamePlayer.find({game: { $eq: req.params.gameId }, user: { $eq: req.params.userId }})
        .then((player) => {
            return res.json(player)
        })
        .catch((e) => error.unhandled(res, e))
}
