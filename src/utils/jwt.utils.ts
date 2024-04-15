import config from 'config'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { IDecodedToken } from '../types'

export function signJWT({
  payload,
  tokenType
}: {
  payload: object
  tokenType: 'accessToken' | 'refreshToken'
}) {
  const privateKey = config.get<string>(`tokens.${tokenType}PrivateKey`)

  return jwt.sign(payload, privateKey, {
    // options?: jwt.SignOptions | undefined
    expiresIn: config.get<string>(`tokens.${tokenType}TimeToLive`),
    algorithm: 'RS256'
  })
}

export function verifyJWT({
  token,
  tokenType
}: {
  token: string
  tokenType: 'accessToken' | 'refreshToken'
}): IDecodedToken {
  try {
    const pubKey = config.get<string>(`tokens.${tokenType}PublicKey`)
    const decoded = jwt.verify(token, pubKey)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (err: unknown) {
    return {
      valid: false,
      expired: (err as JsonWebTokenError).message === 'jwt expired',
      decoded: ''
    }
  }
}
