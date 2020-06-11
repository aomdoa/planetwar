import { PrismaClient } from '@prisma/client'
import { successMessage, failMessage, getCurrentUser } from './shared'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * GET games - listOfGames
 * GET games?id=ID - detailsForGame
 * POST games - createGame - { name, number of turns, time between turns }
 * PUT games?id=ID - addPlayer - { playerId }
 * DELETE games?id=ID - set game state to 0 which stops it
 *
 * gameData {
 *  id,
 *  name,
 *  state - boolean, 1 is active and 0 is inActive
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
  const user = getCurrentUser(req)
  if (!user) {
    return failMessage(res, `User must be authenticated`)
  }

  const gameId = Number(req.query.id)
  if (req.method === 'POST' && user.isAdmin === true) {
    return handleCreate(req.body, res)
  } else if (req.method === 'GET') {
    if (gameId) {
      return handleGetOne(gameId, res)
    } else {
      return handleGetList(res)
    }
  } else if (req.method === 'DELETE' && user.isAdmin === true) {
    return handleDelete(gameId, res)
  }
  return failMessage(res, 'Not done yet')
}

/**
 * Retrieves the game from the db by id
 * @param gameId The id of the game to retrieve
 * @return game data
 */
async function selectOneGame(gameId) {
  console.log(`selectOneGame gameId: ${gameId}`)
  if (!(gameId > 0)) {
    throw new Error(`Invalid game id: ${gameId}`)
  }

  const game = await prisma.game.findOne({
    where: { id: gameId },
  })
  console.dir(game)
  return game
}

/**
 * Retrieve the list of games in the true state from the database
 * @param res
 * @return standard message with list of game data
 */
async function handleGetList(res) {
  console.log(`handleGetList`)
  const games = await prisma.game.findMany({
    where: { state: true },
  })
  console.dir(games)
  return successMessage(res, games)
}

/**
 * Retrieve the requested game
 * @param gameId The id of the game to load
 * @param res
 * @return standard message with the game data
 */
async function handleGetOne(gameId, res) {
  console.log(`handleGetOne ${gameId}`)

  try {
    const game = await selectOneGame(gameId)
    if (game) {
      return successMessage(res, game)
    } else {
      return failMessage(res, `Could not find game with id ${gameId}`)
    }
  } catch (err) {
    return failMessage(res, err.message)
  }
}

/**
 * Creates the game based on the provided name and rules
 * By default the default rules are used
 * @param data The rules to be set with the game creation
 * @param res
 * @return standard message with the created game data
 */
async function handleCreate(data, res) {
  console.log(`handleCreate ${JSON.stringify(data)}`)
  if (!data.name) {
    return failMessage(res, 'name must be provided for the game')
  }
  const existingNameCount = await prisma.game.count({
    where: {
      name: data.name,
      state: true,
    },
  })
  if (existingNameCount > 0) {
    return failMessage(
      res,
      `Active game with name ${data.name} is already running`
    )
  }
  data.state = true

  try {
    const game = await prisma.game.create({
      data: data,
    })
    console.log(`returning createdGame ${JSON.stringify(game)}`)
    return successMessage(res, game)
  } catch (err) {
    return failMessage(res, err.message)
  }
}

/**
 * Sets the game to non-active state
 * @param gameId The id of the game to deactivate
 * @param res
 * @return The updated game data
 */
async function handleDelete(gameId, res) {
  console.log(`handleDelete ${gameId}`)
  try {
    const game = await selectOneGame(gameId)
    const updatedGame = await prisma.game.update({
      where: { id: game.id },
      data: { state: false },
    })
    return successMessage(res, updatedGame)
  } catch (err) {
    return failMessage(res, err.message)
  }
}
