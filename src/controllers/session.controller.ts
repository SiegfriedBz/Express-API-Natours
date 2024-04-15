import { NextFunction, Request, Response } from 'express'
import { TCreateSessionInput } from '../zodSchema/session.zodSchema'
import { checkPassword } from '../services/user.service'
import AppError from '../utils/AppError.utils'
import { createSession, updateSession } from '../services/session.service'
import { signJWT } from '../utils/jwt.utils'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import logger from '../utils/logger.utils'

/** Login */
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

    // 3. Create access token
    const accessToken = signJWT({
      payload: { user, sessionId: newSession._id },
      tokenType: 'accessToken'
    })

    // 4. Create refresh token
    const refreshToken = signJWT({
      payload: { user, sessionId: newSession._id },
      tokenType: 'refreshToken'
    })

    // 5. Set cookies
    res.cookie('accessToken', accessToken, setTokenCookieOptions('accessToken'))
    res.cookie(
      'refreshToken',
      refreshToken,
      setTokenCookieOptions('refreshToken')
    )

    // 6. Send access + refresh tokens
    res.status(200).json({
      status: 'success'
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
    res.cookie('accessToken', null)
    res.cookie('refreshToken', null)

    return res.status(200).json({
      status: 'success'
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
