import express from 'express'
import {
  createUserHandler,
  getAllUsersHandler,
  getUserHandler,
  getMeHandler,
  forgotMyPasswordHandler,
  resetMyPasswordHandler,
  updateMeHandler,
  updateMyPasswordHandler,
  fakeDeleteMeHandler,
  updateUserHandler
} from '../controllers/user.controller'
import { getMyBookingsHandler } from '../controllers/booking.controller'
import validateRequest from '../middleware/validateRequest'
import requireUser from '../middleware/requireUser'
import restrictToRole from '../middleware/restrictToRole'
import multerUpload from '../middleware/multerUpload'
import uploadImages from '../middleware/uploadImages'
import { userMulterUploadFields } from '../utils/multer.upload.user.utils'
import {
  createUserZodSchema,
  adminUpdateUserZodSchema,
  updateMeZodSchema,
  updateMyPasswordZodSchema,
  forgotMyPasswordZodSchema,
  resetMyPasswordZodSchema
} from '../zodSchema/user.zodSchema'

const router = express.Router()

router
  .route('/signup')
  .post(validateRequest(createUserZodSchema), createUserHandler)

router
  .route('/forgot-my-password')
  .post(validateRequest(forgotMyPasswordZodSchema), forgotMyPasswordHandler)

router
  .route('/reset-my-password')
  .patch(validateRequest(resetMyPasswordZodSchema), resetMyPasswordHandler)

/** User-protected routes */
router.use(requireUser)

router.route('/me').get(getMeHandler)

router
  .route('/update-me') // except password
  .patch(
    multerUpload(userMulterUploadFields),
    validateRequest(updateMeZodSchema),
    uploadImages,
    updateMeHandler
  )

router.route('/delete-me').patch(fakeDeleteMeHandler)

router
  .route('/update-my-password') // only password
  .patch(validateRequest(updateMyPasswordZodSchema), updateMyPasswordHandler)

router
  .route('/my-bookings')
  /** Handle
   * GET /api/v1/users/my-bookings
   */
  .get(getMyBookingsHandler)

/** Admin-protected routes */
router.use(restrictToRole('admin'))
router
  .route('/:userId')
  .get(getUserHandler)
  .patch(validateRequest(adminUpdateUserZodSchema), updateUserHandler)

router.route('/').get(getAllUsersHandler)

export default router
