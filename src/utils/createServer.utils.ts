import config from 'config'
import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from '../routes'

export default function createServer(): Express {
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

  return app
}
