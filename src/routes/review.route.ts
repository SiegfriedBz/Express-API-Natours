import express from 'express'
import requireUser from '../middleware/requireUser'
import setReviewFindFilterOptions from '../middleware/setReviewFindFilterOptions'
import restrictToRole from '../middleware/restrictToRole'
import preValidateAndPresetCreateReview from '../middleware/preValidateAndPresetCreateReview'
import preValidateUpdateReview from '../middleware/preValidateUpdateReview'
import validateRequest from '../middleware/validateRequest'
import {
  getAllReviewsHandler,
  getReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  createReviewOnTourHandler
} from '../controllers/review.controller'
import {
  createReviewZodSchema,
  updateReviewZodSchema
} from '../zodSchema/review.zodSchema'

/** Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence. */
const router = express.Router({ mergeParams: true })

router
  /** Handle
   * GET /api/v1/reviews
   * GET /api/v1/tours/:id/reviews
   */
  .get('/', setReviewFindFilterOptions, getAllReviewsHandler)

router
  /** Handle
   * POST /api/v1/tours/:id/reviews
   */
  .post(
    '/',
    requireUser,
    preValidateAndPresetCreateReview,
    validateRequest(createReviewZodSchema),
    createReviewOnTourHandler
  )

router
  /** Handle
   * GET /api/v1/reviews/:reviewId
   */
  .get('/:reviewId', getReviewHandler)

/**  */
router.use(requireUser)
router
  .route('/:reviewId')
  /** Handle
   * PATCH /api/v1/reviews/:reviewId
   */
  .patch(
    preValidateUpdateReview,
    validateRequest(updateReviewZodSchema),
    updateReviewHandler
  )
  /** Handle
   * DELETE /api/v1/reviews/:reviewId
   */
  .delete(restrictToRole('admin'), deleteReviewHandler)

export default router
