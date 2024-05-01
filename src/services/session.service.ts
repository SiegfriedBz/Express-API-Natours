import { getUser } from './user.service'
import Session from '../models/session.model'
import { signJWT, verifyJWT } from '../utils/jwt.utils'
import type { FilterQuery, Types, UpdateQuery } from 'mongoose'
import type { JwtPayload } from 'jsonwebtoken'
import type { ISessionDocument, ISessionDBInput } from '../types/session.types'
import type { IDecodedToken, IFreshAccessToken } from '../types/tokens.types'
import type { IUserDocument } from '../types/user.types'

/**
 * Retrieves a session by its ID.
 * @param sessionId - The ID of the session.
 * @returns A promise that resolves to the session document or null if not found.
 */
async function getSession(sessionId: string): Promise<ISessionDocument | null> {
  const session = await Session.findById(sessionId).lean()

  return session
}

/**
 * Creates a new session for a user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the newly created session document.
 */
export async function createSession(
  userId: string
): Promise<ISessionDocument | null> {
  const newSession = await Session.create({ user: userId })

  return newSession
}

/**
 * Updates a session based on the provided filter and update query.
 * @param filter - The filter query to find the session to update.
 * @param update - The update query to apply to the session.
 * @returns A promise that resolves to the updated session document.
 */
export async function updateSession(
  filter: FilterQuery<ISessionDocument>,
  update: UpdateQuery<ISessionDBInput> // prevent createdAt, updatedAt update
): Promise<ISessionDocument | null> {
  const updatedSession = await Session.findOneAndUpdate(filter, update, {
    new: true
  })

  return updatedSession
}

/**
 * Generates access and refresh tokens for a user session.
 * @param user - The user document.
 * @param sessionId - The ID of the session.
 * @returns An object containing the access and refresh tokens.
 */
export const generateTokens = ({
  user,
  sessionId
}: {
  user: Omit<IUserDocument, 'password'>
  sessionId: Types.ObjectId
}) => {
  const accessToken = signJWT({
    payload: { user, sessionId },
    tokenType: 'accessToken'
  })

  const refreshToken = signJWT({
    payload: { user, sessionId },
    tokenType: 'refreshToken'
  })

  return { accessToken, refreshToken }
}

/**
 * Re-issues a fresh access token using a refresh token.
 * @param refreshToken - The refresh token.
 * @returns A promise that resolves to the fresh access token and related information, or null if the refresh token is invalid.
 */
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
  const user = await getUser({ userId: session.user })
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
