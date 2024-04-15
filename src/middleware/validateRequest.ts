import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import logger from '../utils/logger'

const validateRequest = (zodSchema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      zodSchema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (err: unknown) {
      logger.error((err as Error).message)
      next(err)
    }
  }
}

export default validateRequest
