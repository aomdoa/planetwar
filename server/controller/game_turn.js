'use strict'
const mongoose = require('mongoose')
const error = require('../error')
const Turn = mongoose.model('Turns')
const GamePlayer = mongoose.model('GamePlayers')

const MIN_LAND_GAIN = 0.02
const MAX_LAND_GAIN = 0.10
const MIN_LAND_COST = 0.01
const MAX_LAND_COST = 0.75

const ARMY_FOOD = 3 

exports.getTurns = function(req, res, next) {
}

exports.doTurn = function(req, res, next) {
    //Expand requires - infantry : get land 
    //Build requires - land + money : get buildings
    //Attack requires - army : fight get land and buildings
    
    //cities increase money generation
    //farms increase food
    //industry increase army

    //cities + army eat food
  
    return GamePlayer.findOne({game: { $eq: req.params.gameId }, user: { $eq: req.decoded.id }})
        .then((player) => {
            if(!player) {
                return error.proc(res, 400, "Unable to find player/game " + req.params.gameId)
            }
            if(!req.body.actionType) {
                return error.proc(res, 400, "No action type has been provided")
            }
            var turn = new Turn()
            turn.result = player.state

            if(req.body.actionType == 'expand') {
                if(!req.body.infantry) {
                    return error.proc(res, 400, "The infantry must be provided for expansion")
                }
                turn.action.resources.land = Math.floor((Math.random() * (MAX_LAND_GAIN - MIN_LAND_GAIN) + MIN_LAND_GAIN) * req.body.infantry)
                if(turn.action.resources.land == 0) {
                    turn.action.army.infantry = req.body.infantry
                } else {
                    turn.action.army.infantry = Math.ceil((Math.random() * (MAX_LAND_COST - MIN_LAND_COST) + MIN_LAND_COST) * req.body.infantry)
                }
                turn.result.resources.land += turn.action.resources.land
                turn.result.army.infantry -= turn.action.army.infantry
            }

            turn.action.resources.food = (turn.result.army.infantry + turn.result.army.tanks + turn.result.army.jets + turn.result.army.bombers) * ARMY_FOOD
            
            var food = turn.result.resources.food - turn.action.resources.food
            if(food < 1) {
                var offset = 1
                var result = Math.ceil(Math.random() 
                turn.result.army.infantry = 
                turn.result.army.tanks
                turn.result.army.jets
                turn.result.army.bombers
            }
            return res.json(turn)
        })
        .catch((e) => error.unhandled(res, e))
}
