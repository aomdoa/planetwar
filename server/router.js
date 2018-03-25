'use strict'
const UserController = require('./controller/user')
const GameController = require('./controller/game')

exports.setup = function(express, app) {
    var router = express.Router()
    router.route('/authenticate')
        .post(UserController.loginUser)
    router.use(UserController.checkUser)

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
        .post(GameController.addPlayer)
        .delete(GameController.remPlayer)
    app.use('/api', router)                                                                                  
    return router
}

