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
