import {
  checkPassword,
  createUser,
  getUser,
  updateUser
} from '../services/user.service'
import { generateTokens } from '../services/session.service'
import AppError from '../utils/AppError.utils'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import type { Request, Response, NextFunction } from 'express'
import type {
  TAdminUpdateUserInput,
  TCreateUserInput,
  TUpdateMeInput,
  TUpdateMyPasswordInput
} from '../zodSchema/user.zodSchema'
import type { IUserDocument } from '../types/user.types'
import { omit } from 'lodash'

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
    next(err)
  }
}

/** User update self - except password */
export const updateMeHandler = async (
  req: Request<object, object, TUpdateMeInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = res.locals.user
    const currentSessionId = res.locals.sessionId

    const { body } = req

    // 1. Update user
    const updatedUser = await updateUser({ _id: currentUserId }, body)

    if (!updatedUser) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wring while updating user'
        })
      )
    }

    // 2. Generate new access + refresh Tokens
    const { accessToken, refreshToken } = generateTokens({
      user: updatedUser,
      sessionId: currentSessionId
    })

    // 3. Set cookies & response
    res.cookie('accessToken', accessToken, setTokenCookieOptions('accessToken'))
    res.cookie(
      'refreshToken',
      refreshToken,
      setTokenCookieOptions('refreshToken')
    )

    // 4. Send response
    return res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    })
  } catch (err: unknown) {
    next(err)
  }
}

/** User update self-password */
export const updateMyPasswordHandler = async (
  req: Request<object, object, TUpdateMyPasswordInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
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
    next(err)
  }
}

/** Admin update user */
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
    next(err)
  }
}
