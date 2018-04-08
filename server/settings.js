'use strict'

module.exports = {
    //Config names
    CNAME_START_TURNS: 'start_turns',
    CNAME_START_MONEY: 'start_money',
    CNAME_START_FOOD: 'start_food',
    CNAME_START_INFANTRY: 'start_infantry',
    CNAME_START_LAND: 'start_land',
    CNAME_MAX_TURNS: 'max_turns',
    CNAME_TIME_TURN: 'time_per_turn',

    //Default values
    DEFAULT_START_TURNS: 5,
    DEFAULT_START_MONEY: 50000,
    DEFAULT_START_FOOD: 100,
    DEFAULT_START_INFANTRY: 100,
    DEFAULT_START_LAND: 5,
    DEFAULT_MAX_TURNS: 50,
    DEFAULT_TIME_TURN: 5
}

module.exports.GAME_CONFIGS = [
    module.exports.CNAME_START_TURNS,
    module.exports.CNAME_START_MONEY,
    module.exports.CNAME_START_INFANTRY,
    module.exports.CNAME_START_LAND,
    module.exports.CNAME_MAX_TURNS,
    module.exports.CNAME_TIME_TURN
]

module.exports.DEFAULT_GAME_CONFIGS = [
    {
        name: module.exports.CNAME_START_TURNS,
        value: module.exports.DEFAULT_START_TURNS
    },{
        name: module.exports.CNAME_START_MONEY,
        value: module.exports.DEFAULT_START_MONEY
    },{
        name: module.exports.CNAME_START_INFANTRY,
        value: module.exports.DEFAULT_START_INFANTRY
    },{
        name: module.exports.CNAME_START_LAND,
        value: module.exports.DEFAULT_START_LAND
    },{
        name: module.exports.CNAME_MAX_TURNS,
        value: module.exports.DEFAULT_MAX_TURNS,
    },{
        name: module.exports.CNAME_TIME_TURN,
        value: module.exports.DEFAULT_TIME_TURN
    },{
        name: module.exports.CNAME_START_FOOD,
        value: module.exports.DEFAULT_START_FOOD
    }
]
