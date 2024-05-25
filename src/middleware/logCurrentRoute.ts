import logger from '../utils/logger.utils'
import type { NextFunction, Request, Response } from 'express'

const logCurrentRoute = (req: Request, res: Response, next: NextFunction) => {
  logger.info(req.originalUrl)

  next()
}

export default logCurrentRoute
