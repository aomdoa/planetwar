'use strict'

const mongoose = require('mongoose')
const User = mongoose.model('Users');

exports.createUser = function(req, res, next) {
    var user = new User(req.body);
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
