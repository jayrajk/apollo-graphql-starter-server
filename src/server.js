import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
import { applyMiddleware } from 'graphql-middleware'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
import { createServer } from 'http'
import cors from 'cors'
import { sentry } from 'graphql-middleware-sentry'
import * as Sentry from '@sentry/node'

import schemaWithoutMiddleware from './graphql'
import middlewares from './graphql/middlewares'
import logger from './logger'
import models from './models'

// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   environment: process.env.NODE_ENV
// })

// export const sentryMiddleware = sentry({
//   sentryInstance: Sentry
// })

const schema = applyMiddleware(
  schemaWithoutMiddleware,
  ...middlewares,
  // sentryMiddleware
)

const server = new ApolloServer({
  schema,
  context: async (ctx) => {
    return {
      models,
      req: ctx.req
    }
  }
})

const app = express()
const corsOptions = {
  credentials: true,
  origin: true
}
if (process.env.NODE_ENV === 'development') {
  app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }))
}
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(async (req, res, next) => {
  const start = Date.now()
  logger.info({
    hostname: process.env.HOSTNAME,
    time: start,
    url: req.url,
    method: req.method,
    log_type: 'request',
    'user_agent': req.headers['user-agent']
  })
  await next()
  let log = {
    respsonse_time: `${Date.now() - start}ms`,
    log_type: 'response',
    status: res.statusCode,
  }
  if (res.req) {
    log.url = res.req.url
    log.method = res.req.method
    log['user_agent'] = res.req.headers['user-agent']
  }

  logger.info(log)
})
app.use(express.static('public'))

models.sequelize.sync()

server.applyMiddleware({ app, cors: false })
let httpServer
if (process.env.NODE_ENV == 'production') {
  const fs = require('fs')
  const https = require('https')

  const key = fs.readFileSync('')
  const cert = fs.readFileSync('')
  const ca = fs.readFileSync('')

  const options = {
    key: key,
    cert: cert,
    ca: ca
  }

  httpServer = https.createServer(options, app)
} else {
  httpServer = createServer(app)
}

server.installSubscriptionHandlers(httpServer)

export default httpServer
