import * as path from 'path'
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas'

const resolverArray = fileLoader(path.join(__dirname, './**/*.resolver*.*'))

export default mergeResolvers(resolverArray)