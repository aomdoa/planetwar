import { PrismaClient } from '@prisma/client'
import { successMessage, failMessage, getCurrentUser } from './shared'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET game?id=GAME_ID - fullPlayerDetails - Will return heavy details with 'current' turn
 * PUT game?id=GAME_ID - turnData - Adds data to the 'current' turn
 * POST game?id=GAME_ID - completeTurn - Completes the current turn - this is where changes are actually applied
 * DELETE game?id=GAME_ID - clearCurrentTurn - Only the non-completed of course
 *
 * gamePlayer {
 *  id - the id in the game
 *  name - the name of the country in game
 *  userId
 *  turns - the amount of available turns
 *  currentTurn - the data that hasn't been posted/commited yet - in progress
 *      id
 *      type - user or attacked
 *      number - turn number
 *      land - amount of change in land
 *          available, coastal, city, agricultre, industrial
 *      money - amount of money change
 *      food - amount of food change
 *      population - amount of population change
 *      army - amount changed
 *          troopers, turrets, bombers, tanks, carriers
 *      turn description - description of the things that took place (array? maybe)
 *  pastTurns - array of turns
 *  currentData - the current posted data that's updated based on turn
 *      land - amount of land in country
 *          available - nothing built but available (can be lost)
 *          coastal
 *          city
 *          agriculture
 *          industrial
 *      money - amount in the bank
 *      food - amount stored
 *      population - current population
 *      tax rate - percentage charged
 *      army
 *          troopers
 *          turrets
 *          bombers
 *          tanks
 *          carriers
 *      army generation rate
 *          troopers
 *          turrets
 *          bombers
 *          tanks
 *          carriers
 * }
 * @param req
 * @param res
 */
export default async function handle(req, res) {
  return failMessage(res, 'Not done yet')
}
