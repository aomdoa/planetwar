import { PrismaClient } from "@prisma/client"
import { successMessage, failMessage, getCurrentUser } from './shared'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { APP_SECRET } from '../config'
import { getUnpackedSettings } from "http2"

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
})

/**
 * Only the POST method to login user
 * POST login with the email and password
 * @param req Standard request parameter for prisma
 * @param res Standard result parameter for prisma
 * @return res.json {success: BOOLEAN, data: { token: TOKEN, user: DATA}}
 */
export default async function handle(req, res) {
  console.log(`auth.ts`)
  if (req.method === "POST") {
      console.log(`POST ${JSON.stringify(req.body)}`)
      
      const user = await prisma.user.findOne({
        where: { email: String(req.body.email) },
      }).catch(err => {
        return failMessage(res, err.message)
      })

      if (!user) {
          return failMessage(res, `Unable to find a user with that email '${req.body.email}' and password '${req.body.password}'`)
      }
   
      console.log(`Maybe logging in user ${JSON.stringify(user)}`)

      console.log(user.password)
      console.log(String(req.body.password))
      const valid = await bcrypt.compare(String(req.body.password), user.password)
      if (!valid) {
        return failMessage(res, `Unable to find a user with that email '${req.body.email}' and password '${req.body.password}'`)
      }
      delete user.password

      const token = jwt.sign(user, APP_SECRET)
      const returnData = { token: token, user: { id: user.id, name: user.name, email: user.email }}
      console.log(`Returning ${JSON.stringify(returnData)}`)
      return successMessage(res, returnData)
  } else {
    return failMessage(res, `Unsupported request type ${req.method}`)
  }
}