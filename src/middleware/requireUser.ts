import type { Request, Response, NextFunction } from 'express'
import AppError from '../utils/AppError.utils'

export default async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // after deserializeAndRefreshUser middleware
  const userId = res.locals?.user?._id

  if (!userId) {
    return next(
      new AppError({
        statusCode: 401,
        message: `Please login to access this resource`
      })
    )
  }

  next()
}
