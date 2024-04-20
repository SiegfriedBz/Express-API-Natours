import logger from '../utils/logger.utils'
import type { Request, Response, NextFunction } from 'express'
import type { AnyZodObject } from 'zod'

/**
 * Validates the request against a given Zod schema.
 *
 * @param zodSchema - The Zod schema to validate against.
 * @returns A middleware function that validates the request.
 */
export default function validateRequest(zodSchema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      zodSchema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })

      next()
    } catch (err: unknown) {
      logger.error(err)
      next(err)
    }
  }
}
