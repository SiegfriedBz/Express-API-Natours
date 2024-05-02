import { getTour } from '../services/tour.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { Request, Response, NextFunction } from 'express'
import type { TCreateReviewInput } from '../zodSchema/review.zodSchema'
import type { ITourDocument } from '../types/tour.types'
import { getBooking } from '../services/booking.service'
import { getReview } from '../services/review.service'

/**
 * Validates and presets the data for creating a review.
 *
 * This middleware performs the following steps:
 * 1. Checks if the tour exists.
 * 2. Checks that the current user has booked the tour.
 * 3. Appends the user ID and tour ID to the request body for the next middleware.
 *
 * @note index at db level enforces that 1 user can only write 1 review for 1 tour
 *
 * @param req - The request object. The `params` property should contain the tour ID.
 * @param res - The response object. The `locals` property should contain the user object.
 * @param next - The next function to call in the middleware chain.
 * @returns void
 *
 * @throws {AppError} If the tour is not found, the user has not booked the tour, or the user has already reviewed the tour.
 */
export default async function preValidateAndPresetCreateReview(
  req: Request<TCreateReviewInput['params'], object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const { params } = req

    const userId: string = res.locals.user._id // after requireUser
    const tourId: string | undefined = params.id // on /tours/:id/reviews

    let tour: ITourDocument | null

    // 1. Checks if the tour exists.
    if (tourId) {
      tour = await getTour(tourId)

      if (!tour) {
        return next(
          new AppError({ statusCode: 404, message: 'Tour not found' })
        )
      }
    }

    // 2. Checks that the current user has booked the tour.
    const userHasBooked = await getBooking({ user: userId, tour: tourId })
    if (!userHasBooked) {
      return next(
        new AppError({
          statusCode: 403,
          message: 'You can only review a tour that you have booked'
        })
      )
    }

    // 3. Checks that the current user did not already review the tour.
    const userDidReview = await getReview({ user: userId, tour: tourId })
    if (userDidReview) {
      return next(
        new AppError({
          statusCode: 403,
          message: 'You can only review a tour once'
        })
      )
    }

    // 4. Appends the user ID and tour ID to the request body for the next middleware
    req.body = { ...req.body, user: userId, tour: tourId }

    next()
  } catch (error) {
    logger.info(error)
    next(error)
  }
}
