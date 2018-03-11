'use strict'

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Promise = require('bluebird')

const User = require('./model/user')
const UserController = require('./controller/user')

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/Planetwar');

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router()

router.route('/users')
    .post((req, res, next) => UserController.createUser(req, res, next))
router.route('/users/:userId')
    .get((req, res, next) => UserController.getUser(req, res, next))
    .put((req, res, next) => UserController.updateUser(req, res, next))

app.use('/api', router)
app.listen(3000, () => console.log('Starting applicaiton'))


