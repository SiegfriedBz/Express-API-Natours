import config from 'config'
import type { CookieOptions } from 'express'

export default function setTokenCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production'

  console.log('CookieOptions isProduction: ', isProduction)
  console.log(
    "CookieOptions config.get<string>('appDomainName'): ",
    config.get<string>('appDomainName')
  )

  return {
    httpOnly: true,
    path: '/',
    domain: isProduction ? config.get<string>('appDomainName') : 'localhost',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  }
}
