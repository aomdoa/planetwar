import { PrismaClient, Player } from '@prisma/client'
import { successMessage, failMessage, getCurrentUser } from './shared'
import { GAME_CONFIG, TURN_CONFIG } from '../config'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET game?id=GAME_ID - fullPlayerDetails - Will return heavy details with 'current' turn
 * PUT game?id=GAME_ID - turnData - Manages the current turn in the phase that it's in - phase along with data is passed for sync confirmation
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

  console.dir(player)

  if (req.method === 'GET') {
    return successMessage(res, player)
  } else if (req.method === 'POST') {
    const phase = Number(req.body.phase)
    if (phase === TURN_CONFIG.START) {
      return startTurn(res, req.body, player)
    } else if (phase ===  TURN_CONFIG.PAYMENT) {
      return paymentTurn(res, req.body, player)
    } else {
      return failMessage(res, `Unknown phase ${phase}`)
    }
  } else {
    return failMessage(res, 'Not done yet')
  }
}

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