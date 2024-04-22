import {
  getAllReviews,
  getReview,
  createReviewOnTour,
  updateReview,
  deleteReview
} from '../services/review.service'
import logger from '../utils/logger.utils'
import AppError from '../utils/AppError.utils'
import type { Request, Response, NextFunction } from 'express'
import type { IReviewDocument } from '../types/review.types'
import type {
  TCreateReviewInput,
  TUpdateReviewInput
} from '../zodSchema/review.zodSchema'

export type TReviewFindFilterOptions = { tour: string } | undefined
// { tour: tourId } on /tours/:id/reviews route

/** Handle
 * GET /api/v1/reviews
 * GET /api/v1/tours/:id/reviews
 */
export const getAllReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req
    const reviewFindFilterOptions: TReviewFindFilterOptions =
      res?.locals?.findFilterOptions

    const reviews: IReviewDocument[] = await getAllReviews({
      query,
      reviewFindFilterOptions
    })

    return res.status(200).json({
      status: 'success',
      dataCount: reviews?.length,
      data: { reviews }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Handle
 * GET /api/v1/reviews/:reviewId
 */
export async function getReviewHandler(
  req: Request<{ reviewId: string }, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      params: { reviewId }
    } = req

    const review = await getReview(reviewId)

    if (!review) {
      return next(
        new AppError({ statusCode: 404, message: 'Review not found' })
      )
    }

    return res.status(200).json({
      status: 'success',
      data: {
        review
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

// TODO ADD ALL CHECKS IN MIDDLEWARE
/** Protected
 *  User who booked a tour && left 0 review on this tour
 */
/** Handle
 * POST /api/v1/tours/:id/reviews
 */
export async function createReviewOnTourHandler(
  req: Request<object, object, TCreateReviewInput['body']>,
  res: Response,
  next: NextFunction
) {
  try {
    const { body } = req

    const newReview = await createReviewOnTour(body)

    return res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

// TODO ADD ALL CHECKS IN MIDDLEWARE
/** Protected
 *  User who booked a tour && left this review on this tour
 */
/** Handle
 * PATCH /api/v1/reviews/:reviewId
 */
export async function updateReviewHandler(
  req: Request<
    TUpdateReviewInput['params'],
    object,
    TUpdateReviewInput['body']
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      params: { reviewId },
      body
    } = req

    const updatedReview = await updateReview({
      filter: { _id: reviewId },
      update: body
    })

    if (!updatedReview) {
      return next(
        new AppError({ statusCode: 404, message: 'Review not found' })
      )
    }

    return res.status(200).json({
      status: 'success',
      data: { review: updatedReview }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin
 */
/** Handle
 * DELETE /api/v1/reviews/:reviewId
 */
export async function deleteReviewHandler(
  req: Request<{ reviewId: string }, object, object>,
  res: Response,
  next: NextFunction
) {
  try {
    const { params } = req
    const reviewId = params.reviewId

    const deletetedReview = await deleteReview(reviewId)

    if (!deletetedReview) {
      return next(
        new AppError({ statusCode: 404, message: 'Review not found' })
      )
    }

    return res.status(204).send()
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
