import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import createServer from '../utils/createServer.utils'
import { handleMongoTestServer } from './utils.ts/handleMongoTestServer.utils'
import { createUserAs } from './utils.ts/createUserAs.utils'
import { loginAs } from './utils.ts/loginAs.utils'
import { verifyJWT } from '../utils/jwt.utils'
import { getTokensFrom } from './utils.ts/getTokensFrom.utils'
import { CORRECT_PASSWORD } from './fixtures/user/generateUserAsInput.fixture'
import type { IUserDocument } from '../types/user.types'
import type { IDecodedToken } from '../types/tokens.types'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('Session routes', () => {
  handleMongoTestServer({ mongoTestServer, app })

  // 1. Create user by using service
  let user: IUserDocument | null = null
  beforeEach(async () => {
    user = await createUserAs({ as: 'user' })
  })

  describe('Create session route - login', () => {
    describe('With a valid email + password', () => {
      it('should return 200 + cookies: valid accessToken + valid refreshToken', async () => {
        /** LOGIN USER */
        const { body, headers } = await supertest(app)
          .post('/api/v1/sessions/login')
          .send({
            email: (user as IUserDocument).email,
            password: CORRECT_PASSWORD
          })
          .expect(200)

        expect(body.status).toBe('success')

        // Get tokens from cookies
        const { accessToken, refreshToken } = getTokensFrom({ headers })

        // Check tokens are valid JWT
        const decodedAccessToken = verifyJWT({
          token: accessToken as string,
          tokenType: 'accessToken'
        })
        expect((decodedAccessToken as IDecodedToken).valid).toBe(true)
        expect(decodedAccessToken).toEqual(
          expect.objectContaining({
            valid: true,
            decoded: expect.objectContaining({
              user: expect.objectContaining({
                _id: user?._id.toString(),
                name: user?.name,
                email: user?.email
              })
            })
          })
        )

        const decodedRefreshToken = verifyJWT({
          token: refreshToken as string,
          tokenType: 'refreshToken'
        })
        expect(decodedRefreshToken).toEqual(
          expect.objectContaining({
            valid: true,
            decoded: expect.objectContaining({
              user: expect.objectContaining({
                _id: user?._id.toString(),
                name: user?.name,
                email: user?.email
              })
            })
          })
        )

        // Check Response
        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              user: expect.objectContaining({
                _id: user?._id.toString(),
                name: user?.name,
                email: user?.email
              })
            })
          })
        )
      })
    })

    describe('With an invalid email / password', () => {
      it('should return 401 + correct error message + undefined cookies', async () => {
        // Login user
        const { body, headers } = await supertest(app)
          .post('/api/v1/sessions/login')
          .send({
            email: (user as IUserDocument).email,
            password: 'WRONG_PASSWORD'
          })
          .expect(401)

        // Check Status
        expect(body.status).toBe('fail')
        expect(body.error.message).toContain('Invalid email or password')

        // Check Cookies
        const cookies = headers?.['set-cookie'] as unknown as
          | string[]
          | undefined

        expect(cookies).toBeUndefined
      })
    })
  })

  describe('Delete session route - logout', () => {
    describe('When the user is logged in', () => {
      let userAccessTokenCookie: string = ''

      // Login user
      beforeEach(async () => {
        const { accessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        userAccessTokenCookie = accessTokenCookie
      })

      it('should log out the user and nullify its cookies', async () => {
        // logout user
        const { body, headers } = await supertest(app)
          .delete('/api/v1/sessions/logout')
          .set('Cookie', userAccessTokenCookie as string)
          .expect(200)

        expect(body.status).toBe('success')

        // Get tokens from cookies
        const { accessToken, refreshToken } = getTokensFrom({ headers })

        // Check tokens are valid JWT
        const decodedAccessToken = verifyJWT({
          token: accessToken as string,
          tokenType: 'accessToken'
        })
        expect((decodedAccessToken as IDecodedToken).valid).toBe(false)

        const decodedRefreshToken = verifyJWT({
          token: refreshToken as string,
          tokenType: 'refreshToken'
        })
        expect((decodedRefreshToken as IDecodedToken).valid).toBe(false)
      })
    })

    describe('When the user is NOT logged in', () => {
      it('should return a 401 + correct eroor message', async () => {
        // logout user
        const { body } = await supertest(app)
          .delete('/api/v1/sessions/logout')
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toContain(
          'Please login to access this resource'
        )
      })
    })
  })
})
