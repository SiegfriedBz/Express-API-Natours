import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import errorMiddleware from '../middleware/errorMiddleware'
import createServer from '../utils/createServer.utils'
import { verifyJWT } from '../utils/jwt.utils'
import { getTokensFrom } from './utils.ts/getTokensFrom'
import { inputFixtureUserAs } from './fixtures/user/userInput.fixture'
import type { IDecodedToken } from '../types/tokens.types'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('Session routes', () => {
  beforeAll(async () => {
    mongoTestServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoTestServer.getUri())
    // Error handler middleware
    app.use(errorMiddleware)
  })
  afterAll(async () => {
    await mongoose.disconnect()
    await mongoTestServer.stop()
  })

  /** CREATE USER - SIGNUP */
  const userInput = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  }
  beforeEach(async () => {
    const { name, email, password, passwordConfirmation } =
      inputFixtureUserAs('user')
    userInput.name = name
    userInput.email = email
    userInput.password = password
    userInput.passwordConfirmation = passwordConfirmation

    await supertest(app).post('/api/users').send(userInput).expect(201)
  })

  describe('Create session route - login', () => {
    describe('With a valid email + password', () => {
      it('should return 200 + cookies: valid accessToken + valid refreshToken', async () => {
        /** LOGIN USER */
        const { body, headers } = await supertest(app)
          .post('/api/sessions')
          .send({ email: userInput.email, password: userInput.password })
          .expect(200)

        expect(body.status).toBe('success')

        // Get tokens from cookies
        const { accessToken, refreshToken } = getTokensFrom(headers)

        // Check tokens are valid JWT
        const decodedAccessToken = verifyJWT({
          token: accessToken as string,
          tokenType: 'accessToken'
        })
        expect((decodedAccessToken as IDecodedToken).valid).toBe(true)

        const decodedRefreshToken = verifyJWT({
          token: refreshToken as string,
          tokenType: 'refreshToken'
        })
        expect((decodedRefreshToken as IDecodedToken).valid).toBe(true)
      })
    })

    describe('With an invalid email / password', () => {
      it('should return 401 + error message + undefined cookies', async () => {
        // Login user
        const { body, headers } = await supertest(app)
          .post('/api/sessions')
          .send({ email: userInput.email, password: 'WRONG_PASSWORD' })
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
      let accessTokenCookie: string = ''

      beforeEach(async () => {
        // Login user
        const { headers } = await supertest(app)
          .post('/api/sessions')
          .send({ email: userInput.email, password: userInput.password })
          .expect(200)

        // Get tokens from cookies
        const { accessToken } = getTokensFrom(headers)

        accessTokenCookie = `accessToken=${accessToken}`
      })

      it('should log out the user and nullify its cookies', async () => {
        // logout user
        const { body, headers } = await supertest(app)
          .delete('/api/sessions')
          .set('Cookie', accessTokenCookie as string)
          .expect(200)

        expect(body.status).toBe('success')

        // Get tokens from cookies
        const { accessToken, refreshToken } = getTokensFrom(headers)

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
      it('should return a 403', async () => {
        // logout user
        const { body } = await supertest(app)
          .delete('/api/sessions')
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toContain(
          'Please login to access this resource'
        )
      })
    })
  })
})
