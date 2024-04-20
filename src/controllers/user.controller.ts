import { omit } from 'lodash'
import {
  checkPassword,
  createUser,
  getAllUsers,
  getUser,
  updateUser
} from '../services/user.service'
import { generateTokens } from '../services/session.service'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { Request, Response, NextFunction } from 'express'
import type {
  TAdminUpdateUserInput,
  TCreateUserInput,
  TUpdateMeInput,
  TUpdateMyPasswordInput
} from '../zodSchema/user.zodSchema'
import type { IUserDocument } from '../types/user.types'

/** User Signup */
export const createUserHandler = async (
  req: Request<object, object, TCreateUserInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req

    const user = await createUser(body)

    return res.status(201).json({
      status: 'success',
      data: { user }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  User get self
 */
export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = res.locals.user._id

    const currentUser = await getUser(currentUserId)

    if (!currentUser) {
      return next(
        new AppError({
          statusCode: 404,
          message: 'User not found'
        })
      )
    }

    return res.status(200).json({
      status: 'success',
      data: { user: currentUser }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  User update self - except password
 */
export const updateMeHandler = async (
  req: Request<object, object, TUpdateMeInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req

    // Get userId & sessionId from prev middlewares (deserializeAndRefreshUser -> requireUser)
    const currentUserId = res.locals.user._id
    const currentSessionId = res.locals.sessionId

    // Get all file names (if any) from multer upload middleware
    const userImageFileName = res.locals.userImageFileName
    const userPhotoName = userImageFileName?.photo

    // Populate data for update
    const data = {
      ...body,
      ...(userPhotoName ? { photo: userPhotoName } : {})
    }

    // Update user
    const updatedUser = await updateUser({ _id: currentUserId }, data)

    if (!updatedUser) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wring while updating user'
        })
      )
    }

    // Generate new access + refresh Tokens
    const { accessToken, refreshToken } = generateTokens({
      user: updatedUser,
      sessionId: currentSessionId
    })

    // Set cookies & response
    res.cookie(
      'accessToken',
      accessToken,
      setTokenCookieOptions()
      // 'accessToken'
    )
    res.cookie(
      'refreshToken',
      refreshToken,
      setTokenCookieOptions()
      // 'refreshToken'
    )

    // Send response
    return res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  User update self-password
 */
export const updateMyPasswordHandler = async (
  req: Request<object, object, TUpdateMyPasswordInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get userEmail from prev middlewares (deserializeAndRefreshUser -> requireUser)
    const currentUserEmail = res.locals.user.email

    const {
      body: {
        currentPassword: submittedCurrentPassword,
        password: submittedNewPassword
      }
    } = req

    // 1. Validate given current password
    const user = await checkPassword({
      email: currentUserEmail,
      password: submittedCurrentPassword
    })

    if (!user) {
      return next(
        new AppError({
          statusCode: 401,
          message: 'Invalid email or password'
        })
      )
    }

    // 2. Hash submittedNewPassword on save user
    user.password = submittedNewPassword
    await user.save()

    // 3. Remove password from user
    const userWithoutPassword = omit(
      user.toObject(),
      'password'
    ) as unknown as Omit<IUserDocument, 'password'>

    // Note - NO user Token update - not necessary as user current update is only for password.

    // 4. Send response
    return res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin
 */
export const updateUserHandler = async (
  req: Request<
    TAdminUpdateUserInput['params'],
    object,
    TAdminUpdateUserInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body,
      params: { userId }
    } = req

    // Check user exists
    const user = await getUser(userId)

    if (!user) {
      return next(new AppError({ statusCode: 404, message: 'User not found' }))
    }

    // Update user
    const updatedUser = await updateUser({ _id: userId }, body)

    // Note - NO user Token update

    return res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin
 */
export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers()

    return res.status(200).json({
      status: 'success',
      dataCount: users?.length,
      data: { users }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin
 */
export const getUserHandler = async (
  req: Request<{ userId: string }, object, object>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { userId }
    } = req

    const user = await getUser(userId)

    if (!user) {
      return next(
        new AppError({
          statusCode: 404,
          message: 'User not found'
        })
      )
    }

    return res.status(200).json({
      status: 'success',
      data: { user }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
