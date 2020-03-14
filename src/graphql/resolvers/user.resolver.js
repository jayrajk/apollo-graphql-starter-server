import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server';

const createToken = async (user, secret, expiresIn) => {
  const { id, email } = user;
  return jwt.sign({ id, email }, secret)
}
export default {
  Query: {
    getUser: async (parent, args, ctx) => {
      const { models } = ctx
      return models.User.findOne(args)
    },
    getUsers: async (parent, args, ctx) => {
      const { models } = ctx
      return models.User.findAll(args)
    }
  },
  Mutation: {
    createUser: (parent, args, ctx) => {
      const { models, secret } = ctx
      const { data } = args
      return models.User.create(data)
    },
    login: async (parent, args, ctx) => {
      const { models, secret } = ctx
      const { data } = args
      const user = await models.User.findByLogin(data.email)

      if (!user) {
        throw new UserInputError('no user found with this login credentials')
      }
      const isValid = await user.validatePassword(data.password)

      if (!isValid) {
        throw new AuthenticationError('Invalid password.')
      }
      return { token: createToken(user, process.env.SECRET, '1440m') }

    },
    updateUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { data, where } = args
      await models.User.update(data, { where: { id: args.where.id } })
      return models.User.findOne({ where: { id: args.where.id } })
    },
    deleteUser: async (parent, args, ctx) => {
      const { models } = ctx
      const { where } = args
      return models.User.destroy({ where: { id: args.where.id } })
    }
  }
}