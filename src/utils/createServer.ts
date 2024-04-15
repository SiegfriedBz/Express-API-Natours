import config from 'config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from '../routes'
import errorMiddleware from './errorMiddleware'

const createServer = () => {
  const app = express()

  app.use(
    cors({
      origin: config.get<string | string[]>('cors.allowedOrigins'),
      credentials: true
    })
  )
  app.use(cookieParser())
  app.use(express.json())

  routes(app)

  app.use(errorMiddleware)

  return app
}

export default createServer
