import { join } from 'path'
import { fileLoader } from 'merge-graphql-schemas'

const hooksResolver = fileLoader(join(__dirname, './**/*.middleware.*'))

export default hooksResolver