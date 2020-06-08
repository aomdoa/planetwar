import { PrismaClient } from "@prisma/client"
import { successMessage, failMessage, getCurrentUser } from './shared'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET games - listOfGames
 * GET games?id=ID - detailsForGame
 * POST games - createGame - { name, number of turns, time between turns }
 * PUT games?id=ID - addPlayer - { playerId }
 * 
 * gameData {
 *  id,
 *  name,
 *  startTurns - number of turns new players get at start
 *  startLand - number of land new players get at start
 *  protectedTurns - number of protected turns
 *  turnTime - amount of seconds between turns being added
 *  amountTurns - number of turns since start
 *  gameDone - time when the game is done (turns?)
 *  gamePlayers - array of gamePlayers that are part of game
 * }
 * @param req
 * @param res 
 */
export default async function handle(req, res) {
    return failMessage(res, "Not done yet")
}