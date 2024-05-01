import config from 'config'
import path from 'path'
import express, { Express } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import routes from '../routes'
// import logger from './logger.utils'

export default function createServer(): Express {
  const app = express()

  // Pug for email templates
  app.set('view engine', 'pug')
  app.set('views', path.join(__dirname, 'views'))

  app.use(
    cors({
      origin: config.get<string | string[]>('cors.allowedOrigins'),
      credentials: true
    })
  )

  app.use(cookieParser())
  app.use(express.static('public'))

  routes(app)

  return app
}
