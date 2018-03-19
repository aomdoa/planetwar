'use strict'
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = mongoose.model('Users');

exports.createUser = function(req, res, next) {
    var user = new User(req.body)
    return user.save()
        .then((user) => res.json(user))
        .catch((e) => res.json(e))
}

exports.getUser = function(req, res, next) {
    return User.findById(req.params.userId)
        .then((user) => res.json(user))
        .catch((e) => res.json(e))
}

exports.updateUser = function(req, res, next) {
    return User.findById(req.params.userId)
        .then((user) => {
            if(req.body.name) {
                user.name = req.body.name
            }
            if(req.body.email) {
                user.email = req.body.email
            }
            if(req.body.password) {
                user.password = req.body.password
            }
            user.save()
                .then((user) => res.json(user))
                .catch((e) => res.json(e))
        })
        .catch((e) => res.json(e))
}

exports.loginUser = function(req, res, next) {
    User.findOne({
        email: req.body.email,
        password: req.body.password
    }).then((user) => {
        if(!user) {
            setTimeout(function() { res.json({token: null}) }, 2000)
        } else {
            var payload = {
                id: user._id,
                name: user.name,
                email: user.email
            }
            var token = jwt.sign(payload, req.app.get('jwtSecret'),{ expiresIn: "24h" })
            res.json({success: true, token: token})
        }
    }).catch((e) => res.json(e))
}
