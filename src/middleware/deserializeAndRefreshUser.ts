import { JwtPayload } from 'jsonwebtoken'
import { reIssueAccessToken } from '../services/session.service'
import { verifyJWT } from '../utils/jwt.utils'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import type { Request, Response, NextFunction } from 'express'
import type { IFreshAccessToken } from '../types'

export default async function deserializeAndRefreshUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  /** 1. Get Tokens from cookies */
  const accessToken = req.cookies?.accessToken
  const refreshToken = req.cookies?.refreshToken

  // no accessToken => just go to next middleware (no error bcz is applied on all routes)
  if (!accessToken) {
    return next()
  }

  /** 2. Decode AccessToken */
  const { decoded: decodedAccessToken, expired: expiredAccessToken } =
    verifyJWT({
      token: accessToken,
      tokenType: 'accessToken'
    })

  // 2.1 Valid & not expired AccessToken
  if (decodedAccessToken) {
    res.locals.user = (decodedAccessToken as JwtPayload).user
    res.locals.sessionId = (decodedAccessToken as JwtPayload)?.sessionId

    return next()
  }

  // 2.2 not corrupted but expired AccessToken & refreshToken present
  if (expiredAccessToken && refreshToken) {
    // 3 Check refreshToken & Issue New AccessToken if refreshToken/user/session valid
    const fresh: IFreshAccessToken | null = await reIssueAccessToken(
      refreshToken as string
    )

    if (fresh == null) {
      return next()
    }

    const { freshAccessToken, user, sessionId } = fresh

    // 4. Set cookie
    res.cookie(
      'accessToken',
      freshAccessToken,
      setTokenCookieOptions('accessToken')
    )

    // 5. Attach data to res.locals
    res.locals.user = user
    res.locals.sessionId = sessionId
  }
  next()
}
