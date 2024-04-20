import logger from '../utils/logger.utils'
import type { NextFunction, Request, Response } from 'express'

const isProd = process.env.NODE_ENV === 'production'

const logCurrentRoute = (req: Request, res: Response, next: NextFunction) => {
  !isProd && logger.info(req.originalUrl)

  next()
}

export default logCurrentRoute
