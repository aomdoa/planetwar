import { PrismaClient } from "@prisma/client"
import { successMessage, failMessage } from './shared'

const prisma = new PrismaClient()

/**
 * Manage the incoming request and direction to the correct underlying message based on the parameter passed through ?
 * @todo Fix the error processing by maybe doing the parent catch
 * @param req Standard request parameter for prisma
 * @param res Standard result parameter for prisma
 */
export default async function handle(req, res) {
  console.log(`user.ts handle`)
  if (req.method === "GET") {
    const userId = req.query.id
    if (userId) {
      return handleGetOne(userId, res)
    } else {
      return handleGetList(res)
    }
  } else if (req.method === "POST") {
      console.log(`POST`)
  } else {
    return failMessage(res, `Unsupported request type ${req.method}`)
  }
}

/**
 * Retrieve a single user based on the req.query.id
 * Posts the resulting user data through res.json
 * @param incomingUserId The user id provided to be loaded from the database
 * @param res
 */
async function handleGetOne(incomingUserId, res) {
  console.log(`handleGetOne ${incomingUserId}`)
  const userId = Number(incomingUserId)
  if (!(userId > 0)) {
    return failMessage(res, `Could not find user with id ${incomingUserId}`)
  }
  
  const user = await prisma.user.findOne({
    where: { id: Number(userId) },
  }).catch(err => {
    return failMessage(res, err.message)
  })
  console.dir(user)

  if (user) {
    return successMessage(res, user)
  } else {
    return failMessage(res, `Could not find user with id ${userId}`)
  }
}

async function handleGetList(res) {
  console.log(`handleGetList`)
  const users = await prisma.user.findMany()
  console.dir(users)
  return successMessage(res, users)
}

async function handleCreate(data, res) {}