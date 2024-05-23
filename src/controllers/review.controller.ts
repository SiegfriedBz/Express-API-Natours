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
import type { TQueryFilterByTourId } from '../middleware/setQueryFilterByTourId'

/**
 * Handler function to get all reviews.
 * GET /api/v1/reviews
 * GET /api/v1/tours/:id/reviews
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the status, data count, and reviews.
 */
export const getAllReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req
    const queryFilterByTourId: TQueryFilterByTourId =
      res?.locals?.queryFilterByTourId

    const reviews: IReviewDocument[] = await getAllReviews({
      queryFilterByTourId,
      query
    })

    return res.status(200).json({
      status: 'success',
      dataCount: reviews?.length,
      data: { reviews }
    })
  } catch (err: unknown) {
    logger.info(err)
    next(err)
  }
}

/**
 * Retrieves a review by its ID.
 * GET /api/v1/reviews/:reviewId
 *
 * @param req - The request object containing the review ID.
 * @param res - The response object to send the review data.
 * @param next - The next function to handle errors.
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

    const review = await getReview({ _id: reviewId })

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
    logger.info(err)
    next(err)
  }
}

/** Protected
 *  User who booked the tour && left 0 review on this tour
 */
/**
 * Creates a new review on a tour.
 * POST /api/v1/tours/:id/reviews
 *
 * @param req - The request object containing the review data in the body.
 * @param res - The response object used to send the JSON response.
 * @param next - The next function to call in the middleware chain.
 * @returns A JSON response with the newly created review.
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
    logger.info(err)
    next(err)
  }
}

/** Protected
 *  User who booked a tour && left this review on this tour
 */
/**
 * Handles the update review request.
 * PATCH /api/v1/reviews/:reviewId
 *
 * @param req - The request object containing the review ID in the params and the updated review data in the body.
 * @param res - The response object used to send the updated review data.
 * @param next - The next function used to pass control to the next middleware.
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
    logger.info(err)
    next(err)
  }
}

/** Protected
 *  Admin
 */
/**
 * Deletes a review.
 * DELETE /api/v1/reviews/:reviewId
 *
 * @param req - The request object containing the reviewId parameter.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 * @returns A 204 No Content response if the review is successfully deleted.
 * @throws {AppError} If the review is not found.
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
    logger.info(err)
    next(err)
  }
}
