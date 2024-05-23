import { omit } from 'lodash'
import { checkPassword } from '../services/user.service'
import {
  createSession,
  generateTokens,
  updateSession
} from '../services/session.service'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { NextFunction, Request, Response } from 'express'
import type { TCreateSessionInput } from '../zodSchema/session.zodSchema'
import type { IUserDocument } from '../types/user.types'

/** LOGIN */
/**
 * Creates a session for a user.
 *
 * @param req - The request object containing the user's email and password.
 * @param res - The response object to send the access and refresh tokens.
 * @param next - The next function to handle errors.
 */
export const createSessionHandler = async (
  req: Request<object, object, TCreateSessionInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body: { email, password }
    } = req

    // 1. Validate user's password
    const user = await checkPassword({ email, password })

    if (!user) {
      return next(
        new AppError({
          statusCode: 401,
          message: 'Invalid email or password'
        })
      )
    }

    // 2. Set user isActive (in case user has previously used "fakeDeleteMe" route)
    user.isActive = true
    user.save()

    // 3. Create a Session
    const newSession = await createSession(user._id)

    if (!newSession) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wrong while creating session'
        })
      )
    }

    // 4. Create Tokens
    // 4.1 Remove password from user
    const userWithoutPassword = omit(
      user.toObject(),
      'password'
    ) as unknown as Omit<IUserDocument, 'password'>

    // 4.2 Create tokens
    const { accessToken, refreshToken } = generateTokens({
      user: userWithoutPassword,
      sessionId: newSession._id
    })

    // 5. Set cookies
    res.cookie('accessToken', accessToken, setTokenCookieOptions())
    res.cookie('refreshToken', refreshToken, setTokenCookieOptions())

    // 6. Send access + refresh tokens
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** LOGOUT */
/**
 * Deletes a session and invalidates associated tokens.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with a success status.
 */
export const deleteSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // after deserializeAndRefreshUser - requireUser
    const sessionId = res.locals.sessionId

    await updateSession({ _id: sessionId }, { isValid: false })

    // kill tokens
    res.cookie('accessToken', '', setTokenCookieOptions())
    res.cookie('refreshToken', '', setTokenCookieOptions())

    return res.status(200).json({
      status: 'success'
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
