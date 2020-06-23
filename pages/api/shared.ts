import jwt from 'jsonwebtoken'
import { APP_SECRET } from '../config'

export function successMessage(res, message) {
  return res.json({ success: true, result: message })
}

export function failMessage(res, message) {
  return res.json({ success: false, result: message })
}

export function getCurrentUser(req) {
  const authorization = req.headers.authorization
  console.log(`getCurrentUser with auth ${authorization}`)
  if (authorization) {
    try {
      const verification = jwt.verify(authorization, APP_SECRET)
      if (verification) {
        console.dir(verification)
        return verification
      }
    } catch (err) {
      console.log(`Error in authentication '${err}'`)
    }
  }
}
