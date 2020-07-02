import { PrismaClient } from '@prisma/client'
import { successMessage } from './shared'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

let gameTimer = null

export default async function handle(req, res) {
    console.log('startGameTimers')
    if (gameTimer === null) {
        gameTimer = setInterval(async () => {
            const now = +new Date
            const games = await prisma.game.findMany({
              where: { state: true },
            })
            console.log(`runGameTimers checking ${games.length} games`)
            games.forEach(async (game) => {
                if (game.turnsDone >= game.gameDone) {
                    console.log(`Game ${game.id} is done, no more turns allowed`)
                } else {
                    const turnTime = game.turnTime * 1000
                    const diff = now - game.lastTurn
                    const nextTurn = (diff >= turnTime) ? true : false
                    if (nextTurn) {
                        console.log(`Game ${game.id} is processing turn`)

                        const players = await prisma.player.findMany({
                            where: { gameId: game.id }
                        })

                        for (let i = 0; i < players.length; i++) {
                            await prisma.player.update({
                                data: { availableTurns: players[i].availableTurns + 1 },
                                where: { id: players[i].id }
                            })
                        }

                        const updatedGame = await prisma.game.update({
                            data: {
                                turnsDone: game.turnsDone + 1,
                                lastTurn: new Date()
                            },
                            where: { id: game.id },
                        })
                    }
                }
            })
        }, 6000)
    }
    return successMessage(res, {})
}