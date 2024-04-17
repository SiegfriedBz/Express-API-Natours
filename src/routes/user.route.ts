import express from 'express'
import {
  createUserHandler,
  updateMeHandler,
  updateMyPasswordHandler,
  updateUserHandler
} from '../controllers/user.controller'
import validateRequest from '../middleware/validateRequest'
import requireUser from '../middleware/requireUser'
import restrictTo from '../middleware/restrictTo'
import {
  createUserZodSchema,
  adminUpdateUserZodSchema,
  updateMeZodSchema,
  updateMyPasswordZodSchema
} from '../zodSchema/user.zodSchema'

const router = express.Router()

// User Signup
router.route('/').post(validateRequest(createUserZodSchema), createUserHandler)

// User-protected routes
router.use(requireUser)

router
  .route('/update-me')
  .put(validateRequest(updateMeZodSchema), updateMeHandler)
router
  .route('/update-my-password')
  .patch(validateRequest(updateMyPasswordZodSchema), updateMyPasswordHandler)

// Admin-protected routes
router.use(restrictTo('admin'))
router
  .route('/:userId')
  .put(validateRequest(adminUpdateUserZodSchema), updateUserHandler)

export default router
