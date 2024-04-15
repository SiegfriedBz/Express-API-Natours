import config from 'config'
import type { CookieOptions } from 'express'

export default function setTokenCookieOptions(
  tokenType: 'accessToken' | 'refreshToken'
): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = config.get<number>(`cookies.${tokenType}CookieTimeToLive`)

  return {
    httpOnly: true,
    path: '/',
    domain: isProduction ? config.get<string>('appDomainName') : 'localhost',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge
  }
}
