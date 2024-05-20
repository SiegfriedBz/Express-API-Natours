import config from 'config'
import { omit } from 'lodash'
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  checkPassword,
  setPasswordResetToken,
  validatePasswordResetToken,
  TUserWithoutPassword
} from '../services/user.service'
import {
  sendWelcomeEmail,
  sendForgotMyPasswordEmail
} from '../services/email.service'
import {
  createSession,
  generateTokens,
  updateSession
} from '../services/session.service'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { Request, Response, NextFunction } from 'express'
import type {
  TCreateUserInput,
  TUpdateMeInput,
  TUpdateMyPasswordInput,
  TForgotMyPasswordInput,
  TResetMyPasswordInput,
  TAdminUpdateUserInput
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

    /** 1. Create user */
    const user: TUserWithoutPassword | null = await createUser(body)

    if (user) {
      /** 2. Send Welcome email */
      const refererUrl =
        req.get('referer') || config.get<string>('cors.allowedOrigins')
      const origin = new URL(refererUrl as string).origin
      const url = `${origin}/me`

      await sendWelcomeEmail({ user, url })
    }

    return res.status(201).json({
      status: 'success',
      data: { user }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** User Reset Password - Step 1
 * POST EMAIL
 * => Send Email with Reset Password Token
 */
export const forgotMyPasswordHandler = async (
  req: Request<object, object, TForgotMyPasswordInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { email }
    } = req

    /** 1. Get user & password reset token */
    const { userWithoutPassword: user, resetToken } =
      await setPasswordResetToken(email)

    /** 2. Send Email with Reset Token / Link */
    // Extract the Referer header from the request
    const refererUrl =
      req.get('referer') || config.get<string>('cors.allowedOrigins')
    const origin = new URL(refererUrl as string).origin
    const url = `${origin}/resetMyPassword-2/2/${resetToken}`

    await sendForgotMyPasswordEmail({ user, url })

    /** 3. Send response */
    res.status(200).json({
      status: 'success',
      message: `Please check your email ${user.email} to change your password.`
    })
  } catch (error) {
    logger.info(error)
    next(error)
  }
}

/** User Reset Password - Step 2
 * POST NEW password (+ confirmation) + Reset Password Token
 * => Send Fresh JWTs
 */
export const resetMyPasswordHandler = async (
  req: Request<object, object, TResetMyPasswordInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { password, resetPasswordToken: submittedResetPasswordToken }
    } = req

    /** 1. Get user based on the resetPasswordToken & Check if resetPasswordToken is still Valid */
    const user: TUserWithoutPassword = await validatePasswordResetToken({
      password,
      submittedResetPasswordToken
    })

    if (!user) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wrong while updating your password'
        })
      )
    }

    /** 2. Create new session */
    const session = await createSession(user._id)

    if (!session) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wrong while creating a new session'
        })
      )
    }

    /** 3. Generate new access + refresh Tokens */
    const { accessToken, refreshToken } = generateTokens({
      user,
      sessionId: session._id
    })

    /** 4. Set cookies & response */
    res.cookie('accessToken', accessToken, setTokenCookieOptions())
    res.cookie('refreshToken', refreshToken, setTokenCookieOptions())

    /** 5. Send response with cookies/JWTs*/
    return res.status(200).json({
      status: 'success',
      data: { user }
    })
  } catch (error) {
    logger.info(error)
    next(error)
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

    const currentUser = await getUser({ _id: currentUserId })

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
          message: 'Something went wrong while updating user'
        })
      )
    }

    // Generate new access + refresh Tokens
    const { accessToken, refreshToken } = generateTokens({
      user: updatedUser,
      sessionId: currentSessionId
    })

    // Set cookies & response
    res.cookie('accessToken', accessToken, setTokenCookieOptions())
    res.cookie('refreshToken', refreshToken, setTokenCookieOptions())

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

    // 2. Hash submittedNewPassword on save user & set isActive
    user.password = submittedNewPassword
    user.isActive = true
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

/** */
export const fakeDeleteMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // after deserializeAndRefreshUser - requireUser
    const currentUserId = res.locals.user._id
    const sessionId = res.locals.sessionId

    // Update session
    await updateSession({ _id: sessionId }, { isValid: false })

    // Update user
    const updatedUser = await updateUser(
      { _id: currentUserId },
      { isActive: false }
    )

    if (!updatedUser) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wrong while updating user'
        })
      )
    }

    // Kill cookies
    res.cookie('accessToken', '', setTokenCookieOptions())
    res.cookie('refreshToken', '', setTokenCookieOptions())

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

/** */

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
    const user = await getUser({ _id: userId })

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
    const { query } = req
    const users = await getAllUsers(query)

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

    const user = await getUser({ _id: userId })

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
