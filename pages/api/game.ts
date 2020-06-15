import { PrismaClient } from '@prisma/client'
import { successMessage, failMessage, getCurrentUser } from './shared'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET game?id=GAME_ID - fullPlayerDetails - Will return heavy details with 'current' turn
 * PUT game?id=GAME_ID - turnData - Adds data to the 'current' turn and then moves to next step
 * POST game?id=GAME_ID - completeTurn - Completes the current turn - this is where changes are actually applied
 * DELETE game?id=GAME_ID - clearCurrentTurn - Only the non-completed of course
 * turn flow
 * - get updated money, food grown, food lost, population, army prod
 * - pay taxes, pay food for army, pay food for people
 * - invade land
 * - build out land
 * - attack players and other territories
 * - optional change tax rate and build rates
 * @param req
 * @param res
 */
export default async function handle(req, res) {
  const user = getCurrentUser(req)
  if (!user) {
    return failMessage(res, `User must be authenticated`)
  }

  const gameId = Number(req.query.id)
  if (req.method === 'GET') {
    const player = await prisma.player.findOne({
      where: { UserGame: { userId: user.id, gameId: gameId } },
      include: { currentTurn: true },
    })

    console.dir(player)
    return failMessage(res, player)
  } else {
    return failMessage(res, 'Not done yet')
  }
}
