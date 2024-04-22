import { Request, Response, NextFunction } from 'express'
import { ITourDocument } from '../types/tour.types'
import { getTour } from '../services/tour.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'

/**
 * Middleware function to set the find filter options for retrieving reviews.
 * Sets the find filter options based on the provided tour id parent route param
 * If tour id parent route param is provided, the filter options will filter reviews by tour.
 * - GET /tours/:id/reviews => ALL REVIEWS on 1 TOUR
 * If tour id parent route param is not provided, the filter options will be empty.
 * - GET /reviews => ALL REVIEWS
 */
export default async function setReviewFindFilterOptions(
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

    res.locals.findFilterOptions = tourId ? { tour: tourId } : {}

    next()
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
