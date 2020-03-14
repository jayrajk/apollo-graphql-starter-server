import { makeExecutableSchema } from 'graphql-tools'
import createGraphQLLogger from 'graphql-log'

import typeDefs from './typeDefs'
import resolvers from './resolvers'

const logExecution = createGraphQLLogger()
logExecution(resolvers)

const schemaWithoutMiddleware = makeExecutableSchema({
  typeDefs,
  resolvers: { ...resolvers },
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

export default schemaWithoutMiddleware
