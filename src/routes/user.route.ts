import express from 'express'
import {
  createUserHandler,
  updateUserHandler
} from '../controllers/user.controller'
import validateRequest from '../middleware/validateRequest'
import requireUser from '../middleware/requireUser'
import restrictTo from '../middleware/restrictTo'
import {
  createUserZodSchema,
  adminUpdateUserZodSchema
} from '../zodSchema/user.zodSchema'

const router = express.Router()

// User Signup
router.route('/').post(validateRequest(createUserZodSchema), createUserHandler)

// User-protected routes
router.use(requireUser)

// Admin-protected routes
router.use(restrictTo('admin'))
router
  .route('/:userId')
  .put(validateRequest(adminUpdateUserZodSchema), updateUserHandler)

export default router
