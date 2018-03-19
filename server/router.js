'use strict'
const UserController = require('./controller/user')
const GameController = require('./controller/game')
const jwt = require('jsonwebtoken')

exports.setup = function(express, app) {
    var router = express.Router()
    router.route('/authenticate')
        .post(UserController.loginUser)
    router.use(function(req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, app.get('jwtSecret'), function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });
    router.route('/users')
        .post(UserController.createUser)
    router.route('/users/:userId')
        .get(UserController.getUser)
        .put(UserController.updateUser)
    router.route('/games')
        .post(GameController.createGame)
        .get(GameController.listGames)
/*    router.route('/games/:userId')
        .get(GameController.usersGames)
    router.route('/games/:gameId')
        .post(GameController.joinGame)*/
    app.use('/api', router)                                                                                  
    return router
}

