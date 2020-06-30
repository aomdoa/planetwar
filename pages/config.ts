export const APP_SECRET = "this is a secret"

export const GAME_CONFIG = {
    POPULATION_GROWTH: 500,
    MAX_POPULATION: 5000,
    INCOME_CITY: 100,
    INCOME_COASTAL: 2000,
    INCOME_INDUSTRIAL: 500,
    FOOD_GROWN: 1000,
    FOOD_LOST: 50,
    NEW_TROOPER: 100,
    NEW_TURRET: 15,
    NEW_BOMBER: 5,
    NEW_TANK: 10,
    NEW_CARRIER: 2,
    TAX_REQ: 5,
    ARMY_FOOD_REQ: 1,
    PEOPLE_FOOD_REQ: .1, 
    INCREASE_LAND_COST: 50,
    BUILD_COASTAL_COST: 500,
    BUILD_CITY_COST: 1000,
    BUILD_AGRICULTURE_COST: 250,
    BUILD_INDUSTRIAL_COST: 1000
}

export const TURN_CONFIG = {
    START: 0,
    PAYMENT: 1,
    BUILD: 2,
    ATTACK: 3,
    CHANGE: 4,
    COMPLETE: 5
}

//TODO: Undo the hacky hack
export const HEADERS = {
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFvbWRvYUBnbWFpbC5jb20iLCJpZCI6MSwibmFtZSI6ImFvbWRvYSIsImlzQWRtaW4iOnRydWUsImlhdCI6MTU5MTgzMTY4NX0.-uXAxUKYUXJj681WlnfDmuOQmak902tXugOAGaoDsCs'
  }
}
