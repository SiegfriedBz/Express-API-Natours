import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import User from '../models/user.model'
import errorMiddleware from '../middleware/errorMiddleware'
import createServer from '../utils/createServer.utils'
import { getTokensFrom } from './utils.ts/getTokensFrom'
import {
  CORRECT_PASSWORD,
  inputFixtureUserAs
} from './fixtures/user/userInput.fixture'
import type { IUserDocument } from '../types/user.types'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('User routes', () => {
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

  const userInput = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  }

  beforeEach(() => {
    const { name, email, password } = inputFixtureUserAs('user')
    userInput.name = name
    userInput.email = email
    userInput.password = password
    userInput.passwordConfirmation = password
  })

  describe('Create user route - sign up', () => {
    describe('With a valid input', () => {
      it('should return 201 + user', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(userInput)
          .expect(201)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              user: expect.objectContaining({
                name: userInput.name,
                email: userInput.email
              })
            })
          })
        )
      })
    })

    describe('When passwords do not match', () => {
      it('should return 400 + correct error message', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send({
            ...userInput,
            passwordConfirmation: 'WRONG_PSWD'
          })
          .expect(400)

        expect(body.error.message).toContain('Passwords do not match')
      })
    })

    describe('With missing passwordConfirmation input', () => {
      it('should return 400 + correct error message', async () => {
        const invalidUserInput: {
          name: string
          email: string
          password: string
          passwordConfirmation?: string
        } = { ...userInput }
        delete invalidUserInput.passwordConfirmation

        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(invalidUserInput)
          .expect(400)

        expect(body.error.message).toContain('passwordConfirmation is required')
      })
    })
  })

  describe('Admin - Update user route', () => {
    let admin: IUserDocument | null = null
    let user: IUserDocument | null = null

    beforeEach(async () => {
      // 1. Create user
      user = await User.create(inputFixtureUserAs('user'))
      user = user.toObject()
      // 2 Create Admin
      admin = await User.create(inputFixtureUserAs('admin'))
      admin = admin.toObject()
    })

    describe('When Admin logged in', () => {
      let adminAccessTokenCookie: string = ''

      beforeEach(async () => {
        // 3. Login as Admin
        const { headers: adminHeaders } = await supertest(app)
          .post('/api/sessions')
          .send({
            email: (admin as IUserDocument).email,
            password: CORRECT_PASSWORD
          })
          .expect(200)

        // Get tokens from cookies
        const { accessToken: adminAccessToken } = getTokensFrom(adminHeaders)
        adminAccessTokenCookie = `accessToken=${adminAccessToken}`
      })

      describe('When userId is valid', () => {
        it('should send a 200 + updated user', async () => {
          // 4. Update user as Admin
          const newName = `name-${crypto.randomUUID()}`
          const updateUserData = {
            ...user,
            name: newName,
            role: 'lead-guide'
          }

          const { body: updateRespBody } = await supertest(app)
            .put(`/api/users/${(user as IUserDocument)._id}`)
            .set('Cookie', adminAccessTokenCookie)
            .send(updateUserData)
            .expect(200)

          expect(updateRespBody.status).toBe('success')
          expect(updateRespBody.data.user.name).toBe(newName)
          expect(updateRespBody.data.user.role).toBe('lead-guide')
        })
      })

      describe('When userId does NOT exist', () => {
        it('should send a 404 + correct error message', async () => {
          // 4. Update user as Admin
          const updateUserData = {
            ...user,
            name: 'NEW_NAME',
            role: 'lead-guide'
          }

          const unexistingUserId = new mongoose.Types.ObjectId().toString()

          const { body: updateRespBody } = await supertest(app)
            .put(`/api/users/${unexistingUserId}`)
            .set('Cookie', adminAccessTokenCookie)
            .send(updateUserData)
            .expect(404)

          expect(updateRespBody.status).toBe('fail')
          expect(updateRespBody.error.message).toBe('User not found')
        })
      })
    })

    describe('When Admin is NOT logged in - & User is logged in ', () => {
      it('should send a 403 + correct error message', async () => {
        // 3. Login as User
        const { headers: userHeaders } = await supertest(app)
          .post('/api/sessions')
          .send({
            email: (user as IUserDocument).email,
            password: CORRECT_PASSWORD
          })
          .expect(200)

        // Get tokens from cookies
        const { accessToken: userAccessToken } = getTokensFrom(userHeaders)

        // 4. Update user as user
        const userAccessTokenCookie = `accessToken=${userAccessToken}`
        const updateUserData = {
          ...user,
          name: 'NEW_NAME',
          role: 'lead-guide'
        }

        const { body: updateRespBody } = await supertest(app)
          .put(`/api/users/${(user as IUserDocument)._id}`)
          .set('Cookie', userAccessTokenCookie)
          .send(updateUserData)
          .expect(403)

        expect(updateRespBody.status).toBe('fail')
        expect(updateRespBody.error.message).toBe(
          "Unauthorized - You don't have permissions. Access restricted to admin."
        )
      })
    })
  })

  describe('User - UpdateMe route', () => {
    let user: IUserDocument | null = null

    beforeEach(async () => {
      // 1. Create user
      user = await User.create(inputFixtureUserAs('user'))
      user = user.toObject()
    })

    describe('When user is logged in', () => {
      let userAccessTokenInit: string = ''
      let userRefreshTokenInit: string = ''
      let userAccessTokenCookieInit: string = ''

      // Login as User
      beforeEach(async () => {
        const { headers: userHeaders } = await supertest(app)
          .post('/api/sessions')
          .send({
            email: (user as IUserDocument).email,
            password: CORRECT_PASSWORD
          })
          .expect(200)

        // Get tokens from cookies
        const { accessToken, refreshToken } = getTokensFrom(userHeaders)
        userAccessTokenInit = accessToken
        userRefreshTokenInit = refreshToken
        userAccessTokenCookieInit = `accessToken=${accessToken}`
      })

      it('should send a 200 + updated user + NEW Access & Refresh Tokens', async () => {
        const newName = `name-${crypto.randomUUID()}`
        const updateUserData = {
          ...user,
          name: newName
        }

        const { body, headers } = await supertest(app)
          .put('/api/users/update-me')
          .set('Cookie', userAccessTokenCookieInit)
          .send(updateUserData)
          .expect(200)

        expect(body.status).toBe('success')
        expect(body.data.user.name).toBe(newName)

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          getTokensFrom(headers)
        expect(newAccessToken).not.toBe(userAccessTokenInit)
        expect(newRefreshToken).not.toBe(userRefreshTokenInit)
      })
    })

    describe('When user is NOT logged in', () => {
      it('should send a 403 + correct error message', async () => {
        const newName = `name-${crypto.randomUUID()}`
        const updateUserData = {
          ...user,
          name: newName
        }

        const { body } = await supertest(app)
          .put('/api/users/update-me')
          .send(updateUserData)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })

  describe('User - UpdateMyPassword route', () => {
    let user: IUserDocument | null = null

    beforeEach(async () => {
      // 1. Create user
      user = await User.create(inputFixtureUserAs('user'))
      user = user.toObject()
    })

    describe('When user is logged in', () => {
      let userAccessTokenCookieInit: string = ''

      // Login as User
      beforeEach(async () => {
        const { headers: userHeaders } = await supertest(app)
          .post('/api/sessions')
          .send({
            email: (user as IUserDocument).email,
            password: CORRECT_PASSWORD
          })
          .expect(200)

        // Get tokens from cookies
        const { accessToken } = getTokensFrom(userHeaders)
        userAccessTokenCookieInit = `accessToken=${accessToken}`
      })

      describe('When user inputs correct current Password', () => {
        it('should send a 200 + updated user + WITHOUT Access & Refresh Tokens', async () => {
          const updatePasswordData = {
            currentPassword: CORRECT_PASSWORD,
            password: 'NEW_PASSWORD',
            passwordConfirmation: 'NEW_PASSWORD'
          }

          const { body, headers } = await supertest(app)
            .patch('/api/users/update-my-password')
            .set('Cookie', userAccessTokenCookieInit)
            .send(updatePasswordData)
            .expect(200)

          expect(body.status).toBe('success')
          expect(body.data.user.name).toBe(userInput.name)

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            getTokensFrom(headers)
          expect(newAccessToken).toBeUndefined
          expect(newRefreshToken).toBeUndefined

          // Check user can login with new password
          const { body: newBody } = await supertest(app)
            .post('/api/sessions')
            .send({
              email: (user as IUserDocument).email,
              password: 'NEW_PASSWORD'
            })
            .expect(200)

          expect(newBody.status).toBe('success')
        })
      })

      describe('When user inputs INCORRECT current Password', () => {
        it('should send a 401 + correct error message', async () => {
          const invalidUpdatePasswordData = {
            currentPassword: 'INCORRECT_PASSWORD',
            password: 'NEW_PASSWORD',
            passwordConfirmation: 'NEW_PASSWORD'
          }

          const { body } = await supertest(app)
            .patch('/api/users/update-my-password')
            .set('Cookie', userAccessTokenCookieInit)
            .send(invalidUpdatePasswordData)
            .expect(401)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Invalid email or password')
        })
      })
    })

    describe('When user is NOT logged in', () => {
      it('should send a 403 + correct error message', async () => {
        const updatePasswordData = {
          currentPassword: CORRECT_PASSWORD,
          password: 'NEW_PASSWORD',
          passwordConfirmation: 'NEW_PASSWORD'
        }

        const { body } = await supertest(app)
          .patch('/api/users/update-my-password')
          .send(updatePasswordData)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })
})
