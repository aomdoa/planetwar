'use strict'
const UserController = require('./controller/user')
const GameController = require('./controller/game')
const GamePlayerController = require('./controller/game_player')

exports.setup = function(express, app) {
    var router = express.Router()
    router.route('/authenticate')
        .post(UserController.loginUser)
    router.use(UserController.checkUser)
    router.route('/me')
        .get(UserController.getMe)
    router.route('/users')
        .post(UserController.createUser)
    router.route('/users/:userId')
        .get(UserController.getUser)
        .put(UserController.updateUser)
    router.route('/games')
        .post(GameController.createGame)
        .get(GameController.listGames)
    router.route('/games/:gameId')
        .get(GameController.getGame)
        .put(GameController.updateGame)
        .delete(GameController.remGame)
    router.route('/games/:gameId/players')
        .get(GamePlayerController.listPlayers)
        .post(GamePlayerController.addPlayer)
        .delete(GamePlayerController.remPlayer)
    router.route('/games/:gameId/players/:userId')
        .get(GamePlayerController.getPlayer)
    /*router.route('/turn/:gameId')
        .get(GameTurnController.getTurn)
        .put(GameTurnController.updateTurn)
        .post(GameTurnController.createTurn)
        .delete(GameTurnController.cancelTurn)*/

    app.use('/api', router)                                                                                  
    return router
}

