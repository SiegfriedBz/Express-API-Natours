import { getUser } from './user.service'
import Session, {
  type ISessionDocument,
  ISessionInput
} from '../models/session.model'
import { signJWT, verifyJWT } from '../utils/jwt.utils'
import type { FilterQuery, Types, UpdateQuery } from 'mongoose'
import type { JwtPayload } from 'jsonwebtoken'
import type { IDecodedToken, IFreshAccessToken } from '../types'

async function getSession(sessionId: Types.ObjectId) {
  const session = await Session.findById(sessionId).lean()

  return session
}

export async function createSession(userId: Types.ObjectId) {
  const newSession = await Session.create({ user: userId })

  return newSession
}

export async function updateSession(
  filter: FilterQuery<ISessionDocument>,
  update: UpdateQuery<ISessionInput> // prevent createdAt, updatedAt update
) {
  const updatedSession = await Session.findOneAndUpdate(filter, update, {
    new: true
  })

  return updatedSession
}

// use refreshToken to issue a fresh accessToken
export async function reIssueAccessToken(
  refreshToken: string
): Promise<IFreshAccessToken | null> {
  // 1. Decode refreshToken
  const { decoded: decodedRefreshToken }: IDecodedToken = verifyJWT({
    token: refreshToken,
    tokenType: 'refreshToken'
  })

  // 2. Check refreshToken
  if (!decodedRefreshToken || !(decodedRefreshToken as JwtPayload)?.sessionId) {
    return null
  }

  // 2.1 Check if session on refreshToken still valid
  const sessionId = (decodedRefreshToken as JwtPayload).sessionId
  const session = await getSession(sessionId)

  if (!session || !session.isValid) {
    return null
  }

  // 2.1 Check if user on refreshToken still exist
  const user = await getUser(session.user)
  if (!user) {
    return null
  }

  // 3. reIssueAccessToken
  const freshAccessToken = signJWT({
    payload: { user, sessionId },
    tokenType: 'accessToken'
  })

  return { freshAccessToken, user, sessionId }
}
