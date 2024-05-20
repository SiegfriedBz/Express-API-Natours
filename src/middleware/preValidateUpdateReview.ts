import { getReview } from '../services/review.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { Request, Response, NextFunction } from 'express'
import type { TUpdateReviewInput } from '../zodSchema/review.zodSchema'
import type { IReviewDocument } from '../types/review.types'

/**
 * Middleware function to pre-validate the update of a review.
 *
 * This middleware performs the following steps:
 * 1. Retrieves the review from the database using the review ID from the request parameters.
 * 2. Checks if the review exists. If not, it sends a 404 error.
 * 3. Checks if the current user is the author of the review. If not, it sends a 403 error.
 *
 * @param req - The Express request object. The `params` property should contain the review ID.
 * @param res - The Express response object. The `locals` property should contain the user object.
 * @param next - The next function to call in the middleware chain.
 * @returns void
 *
 * @throws {AppError} If the review is not found or the current user is not the author of the review.
 */
export default async function preValidateUpdateReview(
  req: Request<TUpdateReviewInput['params'], object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const { params } = req

    const reviewId: string | undefined = params.reviewId // /reviews/:reviewId
    const currentUserId: string = res.locals.user._id // after requireUser

    // 1. Checks if the review exists.
    const review: IReviewDocument | null = await getReview({ _id: reviewId })

    if (!review) {
      return next(
        new AppError({ statusCode: 404, message: 'Review not found' })
      )
    }

    // 2. Checks that the current user is the author of this review
    const userIsAuthor = review.user._id.toString() === currentUserId

    if (!userIsAuthor) {
      return next(
        new AppError({
          statusCode: 403,
          message: 'You can only update a review that you wrote yourself'
        })
      )
    }

    next()
  } catch (error) {
    logger.info(error)
    next(error)
  }
}
