import { rule, shield, allow } from 'graphql-shield'
import jwt from "jsonwebtoken"

export function validateToken(authToken) {
  const token = authToken.slice(7, authToken.length)
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, {}, (err, decoded) => {
      if (err) {
        logger.error(err)
        reject(err)
      }
      return resolve(decoded)
    })
  })
}

export const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  const token = ctx.req.headers['authorization']
  if (token) {
    if (!token.startsWith("Bearer ")) {
      return false
    }

    const userData = await validateToken(token)
    try {
      try {
        ctx.req.user = await ctx.models.User.findOne({ where: { id: userData.id } })
        return true
      } catch (err) {
        logger.error(err)
        return false
      }
    }
    catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.')
    }
  } else {
    throw new AuthenticationError('Please Login')
  }
})

const permissions = shield({
  Query: {
    '*': isAuthenticated
  },
  Mutation: {
    '*': isAuthenticated,
    'login': allow
  }
})

export default permissions
