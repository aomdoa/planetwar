'use strict'

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Promise = require('bluebird')

const config = require('./config')
const User = require('./model/user')
const UserController = require('./controller/user')

mongoose.Promise = Promise;
mongoose.connect(config.database)

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('jwtSecret', config.secret)

var router = express.Router()
router.route('/authenticate')
    .post(UserController.loginUser)
router.route('/users')
    .post(UserController.createUser)
router.route('/users/:userId')
    .get(UserController.getUser)
    .put(UserController.updateUser)
app.use('/api', router)

app.listen(3000, () => console.log('Starting applicaiton'))


