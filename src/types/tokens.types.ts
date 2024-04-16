import jwt from 'jsonwebtoken'
import type { Types } from 'mongoose'
import type { IUserDocument } from './user.types'

export interface IDecodedToken {
  valid: boolean
  expired: boolean
  decoded: string | jwt.JwtPayload
}

export interface IFreshAccessToken {
  freshAccessToken: string
  user: IUserDocument
  sessionId: Types.ObjectId
}
