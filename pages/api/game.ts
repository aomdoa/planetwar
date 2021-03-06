import { PrismaClient, Player } from '@prisma/client'
import { successMessage, failMessage, getCurrentUser } from './shared'
import { GAME_CONFIG, TURN_CONFIG } from '../config'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET game?id=GAME_ID - fullPlayerDetails - Will return heavy details with 'current' turn
 * GET game?id=GAME_ID&action=costs - Will return the costs of buying stuff as an object of types
 * GET game?id=GAME_ID&action=attack - Returns attack results if any
 * PUT game?id=GAME_ID - attackData - Performs the attack - this could probably be placed in the standard post
 * POST game?id=GAME_ID - turnData - Manages the current turn in the phase that it's in - phase along with data is passed for sync confirmation
 * turn flow
 * - get updated money, food grown, food lost, population, army prod
 * -- creates the turn through phase START argument
 * - pay taxes, pay food for army, pay food for people
 * -- sets the values along with phase PAYMENT argument
 * - invade land
 * -- sets the invade along with phase TAKE argument
 * - build out land
 * -- sets the build land along with phase BUILD argument
 * - attack players and other territories
 * -- does the attache along with phase ATTACK argument
 * - optional change tax rate and build rates
 * -- does the change along with phase CHANGE argument
 * - complete turn with the phase COMPLETE argument
 * @param req
 * @param res
 */
export default async function handle(req, res) {
  const user = getCurrentUser(req)
  if (!user) {
    return failMessage(res, `User must be authenticated`)
  }

  const gameId = Number(req.query.id)

  const player = await prisma.player.findOne({
    where: { UserGame: { userId: user.id, gameId: gameId } },
    include: { currentTurn: true },
  })

  if (player === undefined || player === null) {
    return failMessage(res, `Unable to find an active player with id ${user.id} in game ${gameId}`)
  }

  if (req.method === 'GET') {
    if (String(req.query.action) === 'costs') {
      return successMessage(res, GAME_CONFIG)
    } else if (String(req.query.action) === 'attack') {
      return getCurrentTurnAttack(res, player)
    } else {
      return successMessage(res, player)
    }
  } else if (req.method === 'POST') {
    const phase = Number(req.body.phase)
    if (phase === TURN_CONFIG.START) {
      return startTurn(res, req.body, player)
    } else if (phase ===  TURN_CONFIG.PAYMENT) {
      return paymentTurn(res, req.body, player)
    } else if (phase === TURN_CONFIG.BUILD) {
      return buildTurn(res, req.body, player)
    } else if (phase === TURN_CONFIG.ATTACK) {
      return noAttackTurn(res, req.body, player)
    } else if (phase === TURN_CONFIG.CHANGE) {
      return completeTurn(res, req.body, player)
    } else {
      return failMessage(res, `Unknown phase ${phase}`)
    }
  } else if (req.method === 'PUT') {
    return executeAttack(res, req.body, player)
  } else {
    return failMessage(res, 'Not done yet')
  }
}

/**
 * The initial turn processing that actually determines what the player will receive and need to pay
 * @param res 
 * @param data 
 * @param player 
 */
async function startTurn(res, data, player:Player) {
  if (player.currentTurnId > 0) {
    return failMessage(res, `There is an in progress turn and cannot be restarted`)
  }

  //Population management
  var popGrowth = Math.round(player.lndCity * Math.random() * GAME_CONFIG.POPULATION_GROWTH)
  const maxPopulation = player.lndCity * GAME_CONFIG.MAX_POPULATION
  if (player.population + popGrowth > maxPopulation) {
    popGrowth = maxPopulation - player.population
    player.population = maxPopulation
  } else {
    player.population = player.population + popGrowth
  }

  //Income management
  const popTax = Math.round(player.population * (player.taxRate / 100))
  player.money += popTax
  const incomeCoastal = Math.round(player.lndCoastal * Math.random() * GAME_CONFIG.INCOME_COASTAL)
  const incomeIndustrial = 100 - player.genBombers - player.genCarriers - player.genTanks - player.genTroopers - player.genTurrets
  let industryIncome = 0
  if (incomeIndustrial > 0) {
    industryIncome = Math.round(player.lndIndustrial * GAME_CONFIG.INCOME_INDUSTRIAL * incomeIndustrial / 100)
  }

  //Food management
  const foodGrown = Math.round(player.lndAgriculture * Math.random() * GAME_CONFIG.FOOD_GROWN)
  const foodLost = Math.round(player.food * (Math.random() / GAME_CONFIG.FOOD_LOST))
  player.food = player.food + foodGrown - foodLost
  if (player.food < 0) {
    console.log(`We are out of food ${foodGrown} ${foodLost} and now have ${player.food}`)
    player.food = 0
  }

  //Troop management
  const newTroopers = Math.round(player.lndIndustrial * GAME_CONFIG.NEW_TROOPER * player.genTroopers / 100)
  const newTurrets = Math.round(player.lndIndustrial * GAME_CONFIG.NEW_TURRET * player.genTurrets / 100)
  const newBombers = Math.round(player.lndIndustrial * GAME_CONFIG.NEW_BOMBER * player.genBombers / 100)
  const newTanks = Math.round(player.lndIndustrial * GAME_CONFIG.NEW_TANK * player.genTanks / 100)
  const newCarriers = Math.round(player.lndIndustrial * GAME_CONFIG.NEW_CARRIER * player.genCarriers / 100)
  const troopers = player.troopers + newTroopers
  const turrets = player.turrets + newTurrets
  const bombers = player.bombers + newBombers
  const tanks = player.tanks + newTanks
  const carriers = player.carriers + newCarriers

  //Prepare for next turn
  const taxRequired = Math.round(player.population * (GAME_CONFIG.TAX_REQ / 100))
  const armyFood = Math.round((troopers + turrets + bombers + tanks + carriers) * GAME_CONFIG.ARMY_FOOD_REQ)
  const popFood = Math.round(player.population * GAME_CONFIG.PEOPLE_FOOD_REQ)

  const turn = await prisma.turn.create({
    data: {
      player: { connect: { id: player.id } },
      currentPhase: TURN_CONFIG.PAYMENT,
      popGrowth: popGrowth,
      popTax: popTax,
      incomeCoastal: incomeCoastal,
      incomeIndustrial: industryIncome,
      foodGrown: foodGrown,
      foodLost: foodLost,
      newTroopers: newTroopers,
      newTurrets: newTurrets,
      newBombers: newBombers,
      newTanks: newTanks,
      newCarriers: newCarriers,
      taxRequired: taxRequired,
      foodArmyReq: armyFood,
      foodPeopleReq: popFood
    }
  })

  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { connect: { id: turn.id } },
      population: player.population,
      money: player.money + popTax + incomeCoastal + industryIncome,
      food: player.food,
      troopers: troopers,
      turrets: turrets,
      bombers: bombers,
      tanks: tanks,
      carriers: carriers,
    },
    where: { id: player.id },
    include: { currentTurn: true }
  })
  return successMessage(res, updatedPlayer)
}

/**
 * Processes the payment from the player based on the requirements determined
 * TODO: Still needs to the detriments if payments not made properly
 * @param res
 * @param data 
 * @param player 
 */
async function paymentTurn(res, data, player:Player) {
  if (player.currentTurnId === 0 || player.currentTurnId === null) {
    return failMessage(res, `Turn is not currently in progress`)
  }
  if (player.currentTurn.currentPhase !== TURN_CONFIG.PAYMENT) {
    return failMessage(res, `Turn is not in payment phase it is in ${player.currentTurn.currentPhase}`)
  }
  const taxPaid = Number(data.taxPaid)
  if (!(taxPaid >= 0)) {
    return failMessage(res, `The tax value provided is not valid and must be 0 or greater. Value was ${taxPaid}`)
  }
  if (taxPaid > player.money) {
    return failMessage(res, `The tax value provided is larger than the available amount of money. ${taxPaid} is greater than ${player.money}`)
  }
  const foodArmyPaid = Number(data.foodArmyPaid)
  if (!(foodArmyPaid >= 0)) {
    return failMessage(res, `The food value for the army is not valid and must be 0 or greater. Value was ${foodArmyPaid}`)
  }
  const foodPeoplePaid = Number(data.foodPeoplePaid)
  if (!(foodPeoplePaid >= 0)) {
    return failMessage(res, `The food value for the people is not valid and must be a 0 or greater. Value was ${foodPeoplePaid}`)
  }
  if (foodArmyPaid + foodPeoplePaid > player.food) {
    return failMessage(res, `The food values for army and people is greater than the available food.`)
  }
  console.log(`Values are ${taxPaid} ${foodArmyPaid} ${foodPeoplePaid}`)

  const turn = await prisma.turn.update({
    data: {
      currentPhase: TURN_CONFIG.BUILD,
      taxPaid: taxPaid,
      foodArmyPaid: foodArmyPaid,
      foodPeoplePaid: foodPeoplePaid
    },
    where: { id: player.currentTurnId }
  })

  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { connect: { id: turn.id } },
      population: player.population,
      money: player.money - taxPaid,
      food: player.food - foodArmyPaid - foodPeoplePaid,
    },
    where: { id: player.id },
    include: { currentTurn: true }
  })
  return successMessage(res, updatedPlayer)
}

/**
 * Build out the land and buildings based on the entries from the player
 * @param res 
 * @param data 
 * @param player 
 */
async function buildTurn(res, data, player:Player) {
  if (player.currentTurnId === 0 || player.currentTurnId === null) {
    return failMessage(res, `Turn is not currently in progress`)
  }
  if (player.currentTurn.currentPhase !== TURN_CONFIG.BUILD) {
    return failMessage(res, `Turn is not in build phase it is in ${player.currentTurn.currentPhase}`)
  }

  const increaseLand = Number(data.increaseLand)
  if (!(increaseLand >= 0)) {
    return failMessage(res, `The increase land value provided is not valid and must be 0 or greater. Value was ${increaseLand}`)
  }
  const costLand = data.increaseLand * GAME_CONFIG.INCREASE_LAND_COST

  const bldCoastal = Number(data.bldCoastal)
  if (!(bldCoastal >= 0)) {
    return failMessage(res, `The costal build value provided is not valid and must be 0 or greater. Value was ${bldCoastal}`)
  }
  const costCoastal = bldCoastal * GAME_CONFIG.BUILD_COASTAL_COST
  const bldCity = Number(data.bldCity)
  if (!(bldCity >= 0)) {
    return failMessage(res, `The city build value provided is not valid and must be 0 or greater. Value was ${bldCity}`)
  }
  const costCity = bldCity * GAME_CONFIG.BUILD_CITY_COST
  const bldAgriculture = Number(data.bldAgriculture)
  if (!(bldAgriculture >= 0)) {
    return failMessage(res, `The agriculture build value provided is not valid and must be 0 or greater. Value was ${bldAgriculture}`)
  }
  const costAgriculture = bldAgriculture * GAME_CONFIG.BUILD_AGRICULTURE_COST
  const bldIndustrial = Number(data.bldIndustrial)
  if (!(bldIndustrial >= 0)) {
    return failMessage(res, `The costal build value provided is not valid and must be 0 or greater. Value was ${bldIndustrial}`)
  }
  const costIndustrial = bldIndustrial * GAME_CONFIG.BUILD_INDUSTRIAL_COST

  const totalCost = costCoastal + costCity + costAgriculture + costIndustrial
  if ((costLand + totalCost) > player.money) {
    return failMessage(res, `The build cost is ${totalCost} which is greater than the available money of ${player.money}`)
  }
  const totalLand = bldAgriculture + bldCity + bldCoastal + bldIndustrial
  if (totalLand > player.lndAvailable) {
    return failMessage(res, `The purchased land ${totalLand} is greater than the available land ${player.lndAvailable}`)
  }
  const turn = await prisma.turn.update({
    data: {
      currentPhase: TURN_CONFIG.ATTACK,
      increaseLand: increaseLand,
      costIncrease: costLand,
      bldCoastal: bldCoastal,
      bldCity: bldCity,
      bldAgriculture: bldAgriculture,
      bldIndustrial: bldIndustrial,
      costBuild: totalCost
    },
    where: { id: player.currentTurnId }
  })

  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { connect: { id: turn.id } },
      money: player.money - (costLand + totalCost),
      lndAvailable: player.lndAvailable + increaseLand - totalLand,
      lndCoastal: player.lndCoastal + bldCoastal,
      lndCity: player.lndCity + bldCity,
      lndAgriculture: player.lndAgriculture + bldAgriculture,
      lndIndustrial: player.lndIndustrial + bldIndustrial
    },
    where: { id: player.id },
    include: { currentTurn: true }
  })

  return successMessage(res, updatedPlayer)
}

/**
 * If there's an attack for the current turn return it
 * @param res 
 * @param player 
 */
async function getCurrentTurnAttack(res, player:Player) {
  const attacks = await prisma.attack.findMany({
    where: {
      turnId: player.currentTurnId
    }
  })
  console.dir(attacks)
  if (attacks.length > 0) {
    return successMessage(res, attacks[0])
  } else {
    return successMessage(res, {})
  }
}

/**
 * Player decides to not attack any other players real or fake
 * @param res 
 * @param data 
 * @param player 
 */
async function noAttackTurn(res, data, player:Player) {
  if (player.currentTurnId === 0 || player.currentTurnId === null) {
    return failMessage(res, `Turn is not currently in progress`)
  }
  if (player.currentTurn.currentPhase !== TURN_CONFIG.ATTACK) {
    return failMessage(res, `Turn is not in attack phase it is in ${player.currentTurn.currentPhase}`)
  }

  const turn = await prisma.turn.update({
    data: {
      currentPhase: TURN_CONFIG.CHANGE
    },
    where: { id: player.currentTurnId }
  })

  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { connect: { id: turn.id } },
    },
    where: { id: player.id },
    include: { currentTurn: true }
  })
  return successMessage(res, updatedPlayer)
}

/**
 * Player executes an attack against the fake player to try and gain stuff
 * @param res 
 * @param data 
 * @param player 
 */
async function executeAttack(res, data, player:Player) {
  console.log('executeAttack')

  const playerType = Number(data.playerType)
  const sentTroopers = Number(data.sentTroopers)
  const sentBombers = Number(data.sentBombers)
  const sentTanks = Number(data.sentTanks)

  if (playerType <= 0) {
    return failMessage(res, `You must select a target for your attack!`)
  }

  if (sentTroopers === 0 && sentBombers === 0 && sentTanks === 0) {
    return failMessage(res, `At least one type of troop must be sent for the attack`)
  }

  if (sentTroopers < 0 || sentTroopers > player.troopers) {
    return failMessage(res, `Unable to send ${sentTroopers} troopers!`)
  }
  if (sentBombers < 0 || sentBombers > player.bombers) {
    return failMessage(res, `Unable to send ${sentBombers} bombers!`)
  }
  if (sentTanks < 0 || sentTanks > player.tanks) {
    return failMessage(res, `Unable to send ${sentTanks} tanks!`)
  }

  //DO THE ATTACK
  const attackResults = {
    playerType: playerType,
    turn: { connect: { id: player.currentTurnId } },
    tgtPlayer: null,
    lostTroopers: 0,
    lostBombers: 0,
    lostTanks: 0,
    killedTroopers: 0,
    killedTurrets: 0,
    killedCarriers: 0,
    killedBombers: 0,
    killedTanks: 0,
    gainedAvailLand: 0,
    gainedCity: 0,
    gainedAgriculture: 0,
    gainedCoastal: 0,
    gainedIndustrial: 0
  }

  //TODO: Make the target selection actually do something... not sure what yet
  const defTroopers = player.troopers * (Math.random() + GAME_CONFIG.TGT_STRENGTH_BONUS)
  console.log(`Troopers: ${defTroopers}`)
  const defTurrets = player.bombers * (Math.random() + GAME_CONFIG.TGT_STRENGTH_BONUS)
  console.log(`Turrets: ${defTurrets}`)
  const defCarriers = player.tanks * (Math.random() + GAME_CONFIG.TGT_STRENGTH_BONUS)
  console.log(`Carriers: ${defCarriers}`)

  const attackStrength = sentTroopers * GAME_CONFIG.ATTACK_TROOPER +
                         sentBombers  * GAME_CONFIG.ATTACK_BOMBER +
                         sentTanks    * GAME_CONFIG.ATTACK_TANK
  const defenseStrength = defTroopers * GAME_CONFIG.DEFENSE_TROOPER +
                          defTurrets  * GAME_CONFIG.DEFENSE_TURRET +
                          defCarriers * GAME_CONFIG.DEFENSE_CARRIER
 
  //TODO: Blergh still cruft but it's something
  let warResult = 0
  if (attackStrength < defenseStrength) {
    warResult = Math.random() % GAME_CONFIG.ATTACK_LOSE_LOSS
    attackResults.killedTroopers = Math.round(defTroopers * GAME_CONFIG.ATTACK_WIN_LOSS)
    attackResults.killedTurrets = Math.round(defTurrets * GAME_CONFIG.ATTACK_WIN_LOSS)
    attackResults.killedCarriers = Math.round(defTurrets * GAME_CONFIG.ATTACK_WIN_LOSS)
  } else {
    warResult = Math.random() % GAME_CONFIG.ATTACK_WIN_LOSS
    attackResults.killedTroopers = Math.round(defTroopers * GAME_CONFIG.ATTACK_LOSE_LOSS)
    attackResults.killedTurrets = Math.round(defTurrets * GAME_CONFIG.ATTACK_LOSE_LOSS)
    attackResults.killedCarriers = Math.round(defTurrets * GAME_CONFIG.ATTACK_LOSE_LOSS)
    attackResults.gainedAvailLand = Math.round(GAME_CONFIG.TGT_LAND_CAPTURE * Math.random())
    attackResults.gainedCity = Math.round(GAME_CONFIG.TGT_LAND_CAPTURE * Math.random())
    attackResults.gainedCoastal = Math.round(GAME_CONFIG.TGT_LAND_CAPTURE * Math.random())
    attackResults.gainedAgriculture = Math.round(GAME_CONFIG.TGT_LAND_CAPTURE * Math.random())
    attackResults.gainedIndustrial = Math.round(GAME_CONFIG.TGT_LAND_CAPTURE * Math.random())
  }
  attackResults.lostTroopers = Math.round(sentTroopers * warResult)
  attackResults.lostBombers = Math.round(sentBombers * warResult)
  attackResults.lostTanks = Math.round(sentTanks * warResult)

  // Store the results and kick over to the turn transition
  const attackResult = await prisma.attack.create({ data: attackResults })
  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { connect: { id: player.currentTurnId } },
      lndAvailable: player.lndAvailable + attackResults.gainedAvailLand,
      lndCoastal: player.lndCoastal + attackResults.gainedCoastal,
      lndCity: player.lndCity + attackResults.gainedCity,
      lndAgriculture: player.lndAgriculture + attackResults.gainedAgriculture,
      lndIndustrial: player.lndIndustrial + attackResults.gainedIndustrial,
      troopers: player.troopers - attackResults.killedTroopers,
      bombers: player.bombers - attackResults.killedBombers,
      tanks: player.tanks - attackResults.killedTanks
    },
    where: { id: player.id },
    include: { currentTurn: true }
  })

  return noAttackTurn(res, data, player)
}

/**
 * Complete the turn of the player changing the generation values if entered
 * @param res 
 * @param data 
 * @param player 
 */
async function completeTurn(res, data, player:Player) {
  if (player.currentTurnId === 0 || player.currentTurnId === null) {
    return failMessage(res, `Turn is not currently in progress`)
  }
  if (player.currentTurn.currentPhase !== TURN_CONFIG.CHANGE) {
    return failMessage(res, `Turn is not in complete phase it is in ${player.currentTurn.currentPhase}`)
  }

  if (data.taxRate.length > 0) {
    const taxRate = Number(data.taxRate)
    if (taxRate > 0 && taxRate <= 100) {
      player.taxRate = taxRate
    } else {
      return failMessage(res, `The tax rate of ${data.taxRate} needs to be valid number from 1 to 100`)
    }
  }

  if (data.genTroopers || data.genTurrets || data.genBombers || data.genTanks || data.genCarriers) {
    const genTroopers = Number(data.genTroopers)
    const genTurrets = Number(data.genTurrets)
    const genBombers = Number(data.genBombers)
    const genTanks = Number(data.genTanks)
    const genCarriers = Number(data.genCarriers)
    if (!(genTroopers >= 0) || !(genTroopers <= 100)) {
      return failMessage(res, `The troop generation must have a value from 0 to 100. The value of ${genTroopers} is invalid`)
    }
    if (!(genTurrets >= 0) || !(genTurrets <= 100)) {
      return failMessage(res, `The turret generation must have a value from 0 to 100. The value of ${genTurrets} is invalid`)
    }
    if (!(genBombers >= 0) || !(genBombers <= 100)) {
      return failMessage(res, `The bomber generation must have a value from 0 to 100. The value of ${genBombers} is invalid`)
    }
    if (!(genTanks >= 0) || !(genTanks <= 100)) {
      return failMessage(res, `The tank generation must have a value from 0 to 100. The value of ${genTanks} is invalid`)
    }
    if (!(genCarriers >= 0) || !(genCarriers <= 100)) {
      return failMessage(res, `The carrier generation must have a value from 0 to 100. The value of ${genCarriers} is invalid`)
    }
    if((genTroopers + genTurrets + genBombers + genTanks + genCarriers) > 100) {
      return failMessage(res, `The troop generation cannot be greater than 100 in total`)
    }

    player.genTroopers = genTroopers
    player.genTurrets = genTurrets
    player.genBombers = genBombers
    player.genTanks = genTanks
    player.genCarriers = genCarriers
  }

  const now = new Date()
  const turn = await prisma.turn.update({
    data: {
      currentPhase: TURN_CONFIG.COMPLETE,
      completedAt: now
    },
    where: { id: player.currentTurnId }
  })

  const updatedPlayer = await prisma.player.update({
    data: {
      currentTurn: { disconnect: true },
      availableTurns: player.availableTurns - 1,
      taxRate: player.taxRate,
      genTroopers: player.genTroopers,
      genTurrets: player.genTurrets,
      genBombers: player.genBombers,
      genTanks: player.genTanks,
      genCarriers: player.genCarriers
    },
    where: { id: player.id }
  })
  return successMessage(res, updatedPlayer)
}