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

    // 2. Create a Session
    const newSession = await createSession(user._id)

    if (!newSession) {
      return next(
        new AppError({
          statusCode: 500,
          message: 'Something went wring while creating session'
        })
      )
    }

    // 3. Create Tokens
    // 3.1 Remove password from user
    const userWithoutPassword = omit(
      user.toObject(),
      'password'
    ) as unknown as Omit<IUserDocument, 'password'>

    // 3.2 Create tokens
    const { accessToken, refreshToken } = generateTokens({
      user: userWithoutPassword,
      sessionId: newSession._id
    })

    // 4. Set cookies
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

    // 5. Send access + refresh tokens
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
export const deleteSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // after deserializeAndRefreshUser - requireUser middlewares
    const sessionId = res.locals.sessionId

    await updateSession({ _id: sessionId }, { isValid: false })

    // kill tokens
    res.cookie('accessToken', '')
    res.cookie('refreshToken', '')

    return res.status(200).json({
      status: 'success'
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
