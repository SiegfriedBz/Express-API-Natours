import express from 'express'
import {
  createUserHandler,
  getAllUsersHandler,
  getMeHandler,
  getUserHandler,
  updateMeHandler,
  updateMyPasswordHandler,
  updateUserHandler
} from '../controllers/user.controller'
import validateRequest from '../middleware/validateRequest'
import requireUser from '../middleware/requireUser'
import restrictToRole from '../middleware/restrictToRole'
import multerUpload from '../middleware/multerUpload'
import resizeImages from '../middleware/resizeImages'
import { userMulterUploadFields } from '../utils/multer.upload.user.utils'
import {
  createUserZodSchema,
  adminUpdateUserZodSchema,
  updateMeZodSchema,
  updateMyPasswordZodSchema
} from '../zodSchema/user.zodSchema'

const router = express.Router()

router
  .route('/signup')
  /** SIGNUP */
  .post(validateRequest(createUserZodSchema), createUserHandler)

/** User-protected routes */
router.use(requireUser)

router.route('/me').get(getMeHandler)
router
  .route('/update-me')
  .patch(
    multerUpload(userMulterUploadFields),
    validateRequest(updateMeZodSchema),
    resizeImages,
    updateMeHandler
  )
router
  .route('/update-my-password')
  .patch(validateRequest(updateMyPasswordZodSchema), updateMyPasswordHandler)

/** Admin-protected routes */
router.use(restrictToRole('admin'))
router
  .route('/:userId')
  .get(getUserHandler)
  .patch(validateRequest(adminUpdateUserZodSchema), updateUserHandler)

router.route('/').get(getAllUsersHandler)

export default router
