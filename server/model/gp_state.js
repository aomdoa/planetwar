'use strict'

var GpState = {
    resources: {
        money: {
            type: Number,
            min: 0,
            default: 0
        },
        land: {
            type: Number,
            min: 0,
            default: 0
        },
        food: {
            type: Number,
            min: 0,
            default: 0,
        }
    },
    buildings: {
        cities: {
            type: Number,
            min: 0,
            default: 0
        },
        farms: {
            type: Number,
            min: 0,
            default: 0
        },
        industry: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    army: {
        infantry: {
            type: Number,
            min: 0,
            default: 0
        },
        tanks: {
            type: Number,
            min: 0,
            default: 0
        },
        jets: {
            type: Number,
            min: 0,
            default: 0
        },
        bombers: {
            type: Number,
            min: 0,
            default: 0
        },
        turrets: {
            type: Number,
            min: 0,
            default: 0
        }
    }
}

module.exports = GpState

