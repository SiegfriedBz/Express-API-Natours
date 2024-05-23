import config from 'config'
import type { CookieOptions } from 'express'

export default function setTokenCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    path: '/',
    domain: isProduction ? config.get<string>('serverDomainName') : 'localhost',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  }
}
