import express from 'express'
import requireUser from '../middleware/requireUser'
import restrictTo from '../middleware/restrictTo'
import validateRequest from '../middleware/validateRequest'
import { createTourZodSchema } from '../zodSchema/tour.zodSchema'
import { createTourHandler } from '../controllers/tour.controller'

const router = express.Router()

// Admin / Lead-Guide protected routes
router.use(requireUser, restrictTo('admin', 'lead-guide'))

router
  .route('/')
  /** CREATE TOUR */
  .post(validateRequest(createTourZodSchema), createTourHandler)

export default router
