import { JwtPayload } from 'jsonwebtoken'
import { reIssueAccessToken } from '../services/session.service'
import { verifyJWT } from '../utils/jwt.utils'
import setTokenCookieOptions from '../utils/setTokenCookieOptions.utils'
import type { Request, Response, NextFunction } from 'express'
import type { IFreshAccessToken } from '../types/tokens.types'

/**
 * Middleware function to deserialize and refresh user session.
 *
 * This function performs the following steps:
 * - Retrieves the access and refresh tokens from the request cookies.
 * - If no access token is present, it immediately calls the next middleware.
 * - Otherwise, it decodes the access token.
 * - If the access token is valid and not expired, it attaches the user and session ID to `res.locals` and calls the next middleware.
 * - If the access token is expired but a refresh token is present, it attempts to re-issue a new access token.
 * - If a new access token is issued, it sets the new access token as a cookie and attaches the user and session ID to `res.locals`.
 * - Finally, it calls the next middleware.
 *
 * @param req The incoming request, expected to contain the access and refresh tokens in the cookies.
 * @param res The outgoing response, used to set the new access token cookie and to store the user and session ID.
 * @param next The next middleware function to call.
 */
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
    res.cookie('accessToken', freshAccessToken, setTokenCookieOptions())

    // 5. Attach data to res.locals
    res.locals.user = user
    res.locals.sessionId = sessionId
  }
  next()
}
