import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import Tour from '../models/tour.model'
import createServer from '../utils/createServer.utils'
import { handleMongoTestServer } from './utils.ts/handleMongoTestServer.utils'
import { createUserAs } from './utils.ts/createUserAs.utils'
import { loginAs } from './utils.ts/loginAs.utils'
import { createTourInput } from './fixtures/tour/tour.fixture'
import type { IUserDocument } from '../types/user.types'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('Tour routes', () => {
  handleMongoTestServer({ mongoTestServer, app })

  describe('Create tour route', () => {
    describe('When Admin is logged in', () => {
      // Admin Login
      let admin: IUserDocument | null = null
      let adminAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Admin using Service
        admin = await createUserAs({ as: 'admin' })
        // Login as Admin using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: admin as IUserDocument,
          app
        })

        adminAccessTokenCookie = accessTokenCookie
      })

      describe('With a valid input', () => {
        it('should return 201 + new tour', async () => {
          const tourInput = createTourInput()

          const { body } = await supertest(app)
            .post('/api/tours')
            .set('Cookie', adminAccessTokenCookie)
            .send(tourInput)
            .expect(201)

          expect(body).toEqual(
            expect.objectContaining({
              status: 'success',
              data: expect.objectContaining({
                tour: expect.objectContaining({
                  name: tourInput.name,
                  description: tourInput.description,
                  price: tourInput.price,
                  discount: tourInput.discount,
                  guides: expect.arrayContaining([expect.any(String)])
                })
              })
            })
          )
        })
      })

      describe('With a INVALID input', () => {
        it('should return 400 + correct error message', async () => {
          const invalidTourInput = { ...createTourInput() }
          invalidTourInput.discount = invalidTourInput.price + 1

          const { body } = await supertest(app)
            .post('/api/tours')
            .set('Cookie', adminAccessTokenCookie)
            .send(invalidTourInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Discount must be less than price')
        })
      })
    })

    describe('When Lead-Guide is logged in', () => {
      // Lead-Guide Login
      let leadGuide: IUserDocument | null = null
      let leadGuideAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create leadGuide using Service
        leadGuide = await createUserAs({ as: 'lead-guide' })
        // Login as Lead-Guide using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: leadGuide as IUserDocument,
          app
        })

        leadGuideAccessTokenCookie = accessTokenCookie
      })

      describe('With a valid input', () => {
        it('should return 201 + new tour', async () => {
          const tourInput = createTourInput()

          const { body } = await supertest(app)
            .post('/api/tours')
            .set('Cookie', leadGuideAccessTokenCookie)
            .send(tourInput)
            .expect(201)

          expect(body).toEqual(
            expect.objectContaining({
              status: 'success',
              data: expect.objectContaining({
                tour: expect.objectContaining({
                  name: tourInput.name,
                  description: tourInput.description,
                  price: tourInput.price,
                  discount: tourInput.discount,
                  guides: expect.arrayContaining([expect.any(String)])
                })
              })
            })
          )
        })
      })

      describe('With a INVALID input', () => {
        it('should return 400 + correct error message', async () => {
          const invalidTourInput = { ...createTourInput() }
          invalidTourInput.discount = invalidTourInput.price + 1

          const { body } = await supertest(app)
            .post('/api/tours')
            .set('Cookie', leadGuideAccessTokenCookie)
            .send(invalidTourInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Discount must be less than price')
        })
      })
    })

    describe('When user is NOT logged in', () => {
      it('should return 401 + correct error message', async () => {
        const tourInput = createTourInput()

        const { body } = await supertest(app)
          .post('/api/tours')
          .send(tourInput)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })

    describe('When a User is logged in', () => {
      it('should return 403 + correct error message', async () => {
        // Create User using Service
        const user: IUserDocument = await createUserAs({ as: 'user' })
        // Login as User using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        const userAccessTokenCookie = accessTokenCookie

        // Create tour as User
        const tourInput = createTourInput()
        const { body } = await supertest(app)
          .post('/api/tours')
          .set('Cookie', userAccessTokenCookie)
          .send(tourInput)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toContain(
          "Unauthorized - You don't have permissions. Access restricted to admin, lead-guide"
        )
      })
    })
  })

  describe('Get All tours route', () => {
    it('should return 200 + tours array', async () => {
      // 1. Clean DB - Delete all Tours
      await Tour.deleteMany()

      // 2. Create Tours
      await Tour.create([
        createTourInput(),
        createTourInput(),
        createTourInput()
      ])

      // 3. Get tours using route handler
      const { body } = await supertest(app).get('/api/tours').expect(200)

      expect(body.data.tours.length).toBe(3)
      expect(body).toEqual(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            tours: expect.arrayContaining([
              expect.objectContaining({
                name: expect.any(String),
                duration: expect.any(Number)
              })
            ])
          })
        })
      )
    })
  })
})
