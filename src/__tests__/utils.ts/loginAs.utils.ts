import supertest from 'supertest'
import { Express } from 'express'
import { getTokensFrom } from './getTokensFrom.utils'
import { CORRECT_PASSWORD } from '../fixtures/user/userAsInput.fixture'
import type { IUserDocument } from '../../types/user.types'

type TProps = {
  asDocument: IUserDocument
  app: Express
}

export const loginAs = async ({ asDocument, app }: TProps) => {
  const { headers } = await supertest(app)
    .post('/api/v1/sessions/login')
    .send({
      email: (asDocument as IUserDocument).email,
      password: CORRECT_PASSWORD
    })
    .expect(200)

  // Get tokens from cookies
  const { accessToken, refreshToken } = getTokensFrom({ headers })

  const accessTokenCookie = `accessToken=${accessToken}`
  const refreshTokenCookie = `refreshToken=${refreshToken}`

  return { accessToken, refreshToken, accessTokenCookie, refreshTokenCookie }
}
