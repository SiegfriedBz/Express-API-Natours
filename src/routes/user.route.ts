import express from 'express'
import { createUserHandler } from '../controllers/user.controller'
import validateRequest from '../middleware/validateRequest'
import { createUserZodSchema } from '../zodSchema/user.zodSchema'
const router = express.Router()

router.route('/').post(validateRequest(createUserZodSchema), createUserHandler)

export default router
