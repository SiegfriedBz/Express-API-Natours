import jwt from 'jsonwebtoken'
import type { IUserDocument } from '../models/user.model'
import type { Types } from 'mongoose'

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
