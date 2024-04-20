import type { Request, Response, NextFunction } from 'express'
import AppError from '../utils/AppError.utils'

/**
 * Middleware function to ensure a user is authenticated.
 *
 * This function expects the request (`req`) to contain a user object in `res.locals.user`
 * with an `_id` property, which should be set by a previous middleware
 * (`deserializeAndRefreshUser`).
 *
 * If the user object or its `_id` property is not present, the function assumes the user is not authenticated.
 * It then creates a new `AppError` with a status code of 401 and a message prompting the user to log in,
 * and passes this error to the next middleware.
 *
 * If the user object and its `_id` property are present, the function assumes the user is authenticated
 * and simply calls the next middleware.
 *
 * @param req The incoming request.
 * @param res The outgoing response, expected to contain the user object.
 * @param next The next middleware function to call.
 */
export default async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId: string | undefined = res.locals?.user?._id

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
