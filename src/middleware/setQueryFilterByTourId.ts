import { Request, Response, NextFunction } from 'express'
import { ITourDocument } from '../types/tour.types'
import { getTour } from '../services/tour.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import { IReviewDocument } from '../types/review.types'
import { IBookingDocument } from '../types/booking.types'

/**
 * Middleware function to set the find filter options for retrieving reviews or bookings By Tour Id.
 * Sets the find filter options based on the provided tour id parent route param.
 *
 *  If tour id parent route param is provided, the filter options will filter reviews or bookings by tour.
 * - GET /tours/:id/reviews => ALL REVIEWS on 1 TOUR
 * - GET /tours/:id/bookings => ALL BOOKINGS on 1 TOUR
 *
 *  If tour id parent route param is not provided, the filter options will be empty.
 * - GET /reviews => ALL REVIEWS
 * - GET /bookings => ALL BOOKINGS
 *
 * @param req - The Express request object. The `params` property should contain the tour ID.
 * @param res - The Express response object. The `locals` property will be used to store the find filter options.
 * @param next - The next function to call in the middleware chain.
 * @returns void
 *
 * @throws {AppError} If the tour is not found.
 */

/** { tour: tourId }
 *  on /tours/:id/reviews
 *  on /tours/:id/bookings
 */

export type TQueryFilterByTourId = {
  tour?: IReviewDocument['tour'] | IBookingDocument['tour']
}

export default async function setQueryFilterByTourId(
  req: Request<{ id?: string }, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const { params } = req
    const tourId = params.id

    if (tourId) {
      // Check if tour exist
      const tour: ITourDocument | null = await getTour(tourId)

      if (!tour) {
        return next(
          new AppError({ statusCode: 404, message: 'Tour not found' })
        )
      }
    }

    const queryFilterByTourId: TQueryFilterByTourId = tourId
      ? { tour: tourId }
      : {}

    res.locals.queryFilterByTourId = queryFilterByTourId

    next()
  } catch (err: unknown) {
    logger.info(err)
    next(err)
  }
}
