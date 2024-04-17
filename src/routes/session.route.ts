import express from 'express'
import {
  createSessionHandler,
  deleteSessionHandler
} from '../controllers/session.controller'
import validateRequest from '../middleware/validateRequest'
import { createSessionZodSchema } from '../zodSchema/session.zodSchema'
import requireUser from '../middleware/requireUser'
const router = express.Router()

router
  .route('/')
  /** LOGIN */
  .post(validateRequest(createSessionZodSchema), createSessionHandler)

// requireUser routes
router.use(requireUser)

router
  .route('/')
  /** LOGOUT */
  .delete(deleteSessionHandler)

export default router
