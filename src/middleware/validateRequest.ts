import type { Request, Response, NextFunction } from 'express'
import type { AnyZodObject } from 'zod'

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
      next(err)
    }
  }
}
