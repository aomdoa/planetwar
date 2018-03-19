'use strict'

const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Promise = require('bluebird')

const config = require('./config')
const User = require('./model/user')
const Game = require('./model/game')
const router = require('./router')

mongoose.Promise = Promise;
mongoose.connect(config.database)

const app = express()
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('jwtSecret', config.secret)

router.setup(express, app)

app.listen(3000, () => console.log('Starting applicaiton'))


