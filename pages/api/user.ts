import { PrismaClient } from "@prisma/client"
import { successMessage, failMessage, getCurrentUser } from './shared'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

const selectFields = { id: true, name: true, isAdmin: true, email: false }

/**
 * Manage the incoming request and direction to the correct underlying message based on the parameter passed through
 * GET user?id=NUM - handleGetOne
 * GET user - handleGetList
 * PUT user?id=NUM - handleUpdate - {name, email, password}
 * POST user - handleCreate - {name, email, password}
 * @todo Fix the error processing by maybe doing the parent catch
 * @param req Standard request parameter for prisma
 * @param res Standard result parameter for prisma
 * @return res.json {success: BOOLEAN, data: DATA}
 */
export default async function handle(req, res) {
  console.log(`user.ts handle`)
  if (req.method === "POST") {
    return handleCreate(req.body, res)
  }

  const user = getCurrentUser(req)
  if (!user) {
    return failMessage(res, `User must be authenticated`)
  } else if(user.isAdmin === true) {
    selectFields.email = true
  }

  const userId = Number(req.query.id)
  if (req.method === "GET") {
    if (userId) {
      return handleGetOne(userId, res)
    } else {
      return handleGetList(res)
    }
  } else if (req.method === "PUT") {
    if (user.id !== userId && user.isAdmin !== true) {
      return failMessage(res, `Unable to update other user account`)
    } else {
      return handleUpdate(userId, req.body, res)
    }
  } else {
    return failMessage(res, `Unsupported request type ${req.method}`)
  }
}

/**
 * Utility method to load the user from the database
 * @param incomingUserId The id of the user to load
 * @param res
 * @return User User object found by id
 */
async function selectOneUser(userId, res) {
  console.log(`selectOneUser userId: ${userId}`)
  if (!(userId > 0)) {
    return failMessage(res, `Invalid user id: ${userId}`)
  }

  const user = await prisma.user.findOne({
    select: selectFields,
    where: { id: userId },
  }).catch(err => {
    return failMessage(res, err.message)
  })
  console.dir(user)
  return user
}

/**
 * Retrieve a single user based on the userId
 * @param userId The user id provided to be loaded from the database
 * @param res
 * @return res.json
 */
async function handleGetOne(userId, res) {
  const user = await selectOneUser(userId, res)
  if (user) {
    return successMessage(res, user)
  } else {
    return failMessage(res, `Could not find user with id ${userId}`)
  }
}

/**
 * Retrieves the list of users
 * @param res 
 * @return res.json Array of users
 */
async function handleGetList(res) {
  console.log(`handleGetList`)
  const users = await prisma.user.findMany({
    select: selectFields
  })
  console.dir(users)
  return successMessage(res, users)
}

/**
 * Handle the creation of a new user based on the data
 * @param data The data to use for creation. name, email, password and isAdmin
 * @param res 
 * @return res.json
 */
async function handleCreate(data, res) {
  console.log(`handleCreate ${JSON.stringify(data)}`)
  if(!data.name) {
    return failMessage(res, 'name must be provided for the user')
  } else if(!data.email) {
    return failMessage(res, 'email must be provided for the user')
  } else if(!data.password) {
    return failMessage(res, 'password must be provided for the user')
  } else if(!data.isAdmin) {
    data.isAdmin = false
  } else {
    data.isAdmin = true
  }
  data.password = await bcrypt.hash(data.password, 10)

  try {
    const user = await prisma.user.create({
      select: selectFields,
      data: data
    })
    console.log(`returning createdUser ${JSON.stringify(user)}`)
    return successMessage(res, user)
  } catch(err) {
    return failMessage(res, err.message)
  }
}

/**
 * Handle the update an user based on the id and data
 * @param id The id of the user to update
 * @param data The data to update for the user
 * @param res 
 * @return res.json
 */
async function handleUpdate(id, data, res) {
    console.log(`handleUpdate ${id} ${JSON.stringify(data)}`)
    const user = await selectOneUser(id, res)
    if(data.name) {
      user.name = data.name
    }
    if(data.email) {
      user.email = data.email
    }
    if(data.password) {
      user.password = await bcrypt.hash(data.password, 10)
      console.log(`setting the password from ${data.password} to ${user.password}`)
    }
    console.log(`data is ${data.isAdmin}`)
    if(data.isAdmin === false) {
      user.isAdmin = false
      console.log("isAdmin is false")
    } else if(data.isAdmin === true) {
      user.isAdmin = true
      console.log("isAdmin is true")
    }
    const updatedUser = await prisma.user.update({
      select: selectFields,
      data: user,
      where: { id: user.id },
    })
    console.log(`returning updatedUser ${JSON.stringify(updatedUser)}`)
    return successMessage(res, updatedUser)
}