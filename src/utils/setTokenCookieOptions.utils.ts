import config from 'config'
import type { CookieOptions } from 'express'
import logger from './logger.utils'

export default function setTokenCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  logger.info({ cookieOptionsIsProduction: isProduction })
  logger.info({
    cookieOptionsAppDomain: isProduction
      ? config.get<string>('appDomainName')
      : 'localhost'
  })

  return {
    httpOnly: true,
    path: '/',
    domain: isProduction ? config.get<string>('appDomainName') : 'localhost',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  }
}
