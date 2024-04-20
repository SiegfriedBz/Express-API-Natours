import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import Tour from '../models/tour.model'
import createServer from '../utils/createServer.utils'
import { handleMongoTestServer } from './utils.ts/handleMongoTestServer.utils'
import { createUserAs } from './utils.ts/createUserAs.utils'
import { loginAs } from './utils.ts/loginAs.utils'
import {
  createTourInput,
  EXTRAVAGANT_DISCOUNT
} from './fixtures/tour/tour.fixture'
import type { IUserDocument } from '../types/user.types'
import type { ITourDocument } from '../types/tour.types'
import {
  TOUR_DIFFICULTY,
  type TCreateTourInput
} from '../zodSchema/tour.zodSchema'

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
            .post('/api/v1/tours')
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
          invalidTourInput.discount = EXTRAVAGANT_DISCOUNT

          const { body } = await supertest(app)
            .post('/api/v1/tours')
            .set('Cookie', adminAccessTokenCookie)
            .send(invalidTourInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'If a discount is provided, a price must also be provided and the discount must be less than the price'
          )
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
            .post('/api/v1/tours')
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
          invalidTourInput.discount = EXTRAVAGANT_DISCOUNT

          const { body } = await supertest(app)
            .post('/api/v1/tours')
            .set('Cookie', leadGuideAccessTokenCookie)
            .send(invalidTourInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'If a discount is provided, a price must also be provided and the discount must be less than the price'
          )
        })
      })
    })

    describe('When user is NOT logged in', () => {
      it('should return 401 + correct error message', async () => {
        const tourInput = createTourInput()

        const { body } = await supertest(app)
          .post('/api/v1/tours')
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
          .post('/api/v1/tours')
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

  describe('Update tour route', () => {
    let tourInput: TCreateTourInput['body'] | null = null
    let tour: ITourDocument | null = null

    beforeEach(async () => {
      // Clean DB + Create Tour
      await Tour.deleteMany()
      tourInput = createTourInput()
      tour = await Tour.create(tourInput)
      tour = tour.toObject()
    })

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
        it('should return 200 + updated tour', async () => {
          const newTourName = 'NEW TOUR'
          const tourUpdateInput = {
            name: newTourName
          }

          const { body } = await supertest(app)
            .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
            .set('Cookie', adminAccessTokenCookie)
            .send(tourUpdateInput)
            .expect(200)

          // Check name was updated
          expect(body).toEqual(
            expect.objectContaining({
              status: 'success',
              data: expect.objectContaining({
                tour: expect.objectContaining({
                  name: newTourName,
                  description: (tour as ITourDocument).description,
                  price: (tour as ITourDocument).price,
                  discount: (tour as ITourDocument).discount,
                  startDates: (tour as ITourDocument).startDates.map((date) =>
                    date.toISOString()
                  ),
                  summary: (tour as ITourDocument).summary,
                  guides: expect.arrayContaining([expect.any(String)])
                })
              })
            })
          )
        })
      })

      describe('With a INVALID input', () => {
        it('should return 400 + correct error message', async () => {
          const invalidTourUpdateInput = {
            duration: null
          }

          const { body } = await supertest(app)
            .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
            .set('Cookie', adminAccessTokenCookie)
            .send(invalidTourUpdateInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'Tour duration must be a number greater than 0'
          )
        })
      })
    })

    describe('When Lead-Guide is logged in', () => {
      // Lead-Guide Login
      let leadGuide: IUserDocument | null = null
      let leadGuideAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Lead-Guide using Service
        leadGuide = await createUserAs({ as: 'lead-guide' })
        // Login as Lead-Guide using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: leadGuide as IUserDocument,
          app
        })

        leadGuideAccessTokenCookie = accessTokenCookie
      })

      describe('With a valid input', () => {
        it('should return 200 + updated tour', async () => {
          const newTourName = 'NEW TOUR'
          const tourUpdateInput = {
            name: newTourName
          }

          const { body } = await supertest(app)
            .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
            .set('Cookie', leadGuideAccessTokenCookie)
            .send(tourUpdateInput)
            .expect(200)

          // Check name was updated
          expect(body).toEqual(
            expect.objectContaining({
              status: 'success',
              data: expect.objectContaining({
                tour: expect.objectContaining({
                  name: newTourName,
                  description: (tour as ITourDocument).description,
                  price: (tour as ITourDocument).price,
                  discount: (tour as ITourDocument).discount,
                  startDates: (tour as ITourDocument).startDates.map((date) =>
                    date.toISOString()
                  ),
                  summary: (tour as ITourDocument).summary,
                  guides: expect.arrayContaining([expect.any(String)])
                })
              })
            })
          )
        })
      })

      describe('With a INVALID input', () => {
        it('should return 400 + correct error message', async () => {
          const invalidTourUpdateInput = {
            duration: null
          }

          const { body } = await supertest(app)
            .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
            .set('Cookie', leadGuideAccessTokenCookie)
            .send(invalidTourUpdateInput)
            .expect(400)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'Tour duration must be a number greater than 0'
          )
        })
      })
    })

    describe('When user is NOT logged in', () => {
      it('should return 401 + correct error message', async () => {
        const newTourName = 'NEW TOUR'
        const tourUpdateInput = {
          name: newTourName
        }

        const { body } = await supertest(app)
          .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
          .send(tourUpdateInput)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })

    describe('When a User is logged in', () => {
      // User Login
      let user: IUserDocument | null = null
      let userAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create User using Service
        user = await createUserAs({ as: 'user' })
        // Login as User using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        userAccessTokenCookie = accessTokenCookie
      })
      it('should return 403 + correct error message', async () => {
        const newTourName = 'NEW TOUR'
        const tourUpdateInput = {
          name: newTourName
        }

        const { body } = await supertest(app)
          .patch(`/api/v1/tours/${(tour as ITourDocument)._id}`)
          .set('Cookie', userAccessTokenCookie)
          .send(tourUpdateInput)
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
      const { body } = await supertest(app).get('/api/v1/tours').expect(200)

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

  describe('Get tour route', () => {
    describe('With a valid tour id', () => {
      it('should return 200 + correct tour', async () => {
        // 1. Clean DB - Delete all Tours
        await Tour.deleteMany()

        // 2. Create Tour
        const tourInput = createTourInput()
        const newTour = await Tour.create(tourInput)

        // 3. Get tour using route handler
        const { body } = await supertest(app)
          .get(`/api/v1/tours/${newTour._id}`)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              tour: expect.objectContaining({
                name: newTour.name,
                duration: newTour.duration
              })
            })
          })
        )
      })
    })

    describe('With a unexisting tour id', () => {
      it('should return 400 + correct error message', async () => {
        // 1. Clean DB - Delete all Tours
        await Tour.deleteMany()

        // 2. Create Tour
        await Tour.create(createTourInput())

        // 3. Get tour using route handler
        const fakeTourId = new mongoose.Types.ObjectId().toString()
        const { body } = await supertest(app)
          .get(`/api/v1/tours/${fakeTourId}`)
          .expect(404)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Tour not found')
      })
    })
  })

  describe('Delete tour route', () => {
    let newTour: ITourDocument | null = null
    // Create tour
    beforeEach(async () => {
      // Clean DB & Create Tour
      await Tour.deleteMany()
      const tourInput = createTourInput()
      newTour = await Tour.create(tourInput)
    })

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

      describe('With a valid tour id', () => {
        it('should return 204', async () => {
          // Delete tour using route handler
          await supertest(app)
            .delete(`/api/v1/tours/${(newTour as ITourDocument)._id}`)
            .set('Cookie', adminAccessTokenCookie)
            .expect(204)
        })
      })

      describe('With a unexisting tour id', () => {
        it('should return 400 + correct error message', async () => {
          const fakeTourId = new mongoose.Types.ObjectId().toString()
          // Delete tour using route handler
          const { body } = await supertest(app)
            .delete(`/api/v1/tours/${fakeTourId}`)
            .set('Cookie', adminAccessTokenCookie)
            .expect(404)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Tour not found')
        })
      })
    })

    describe('When Lead-Guide is logged in', () => {
      // Lead-Guide Login
      let leadGuide: IUserDocument | null = null
      let leadGuideAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Lead-Guide using Service
        leadGuide = await createUserAs({ as: 'lead-guide' })
        // Login as Lead-Guide using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: leadGuide as IUserDocument,
          app
        })

        leadGuideAccessTokenCookie = accessTokenCookie
      })

      describe('With a valid tour id', () => {
        it('should return 204', async () => {
          // Delete tour using route handler
          await supertest(app)
            .delete(`/api/v1/tours/${(newTour as ITourDocument)._id}`)
            .set('Cookie', leadGuideAccessTokenCookie)
            .expect(204)
        })
      })

      describe('With a unexisting tour id', () => {
        it('should return 400 + correct error message', async () => {
          const fakeTourId = new mongoose.Types.ObjectId().toString()
          // Delete tour using route handler
          const { body } = await supertest(app)
            .delete(`/api/v1/tours/${fakeTourId}`)
            .set('Cookie', leadGuideAccessTokenCookie)
            .expect(404)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Tour not found')
        })
      })
    })

    describe('When User is logged in', () => {
      // User Login
      let user: IUserDocument | null = null
      let userAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create User using Service
        user = await createUserAs({ as: 'user' })
        // Login as User using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        userAccessTokenCookie = accessTokenCookie
      })

      describe('With a valid tour id', () => {
        it('should return 403 + correct error message', async () => {
          // Delete tour using route handler
          const { body } = await supertest(app)
            .delete(`/api/v1/tours/${(newTour as ITourDocument)._id}`)
            .set('Cookie', userAccessTokenCookie)
            .expect(403)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            "Unauthorized - You don't have permissions. Access restricted to admin, lead-guide."
          )
        })
      })
    })

    describe('When NO User is logged in', () => {
      describe('With a valid tour id', () => {
        it('should return 401 + correct error message', async () => {
          // Delete tour using route handler
          const { body } = await supertest(app)
            .delete(`/api/v1/tours/${(newTour as ITourDocument)._id}`)
            .expect(401)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'Please login to access this resource'
          )
        })
      })
    })
  })

  describe(`Get tours' stats route`, () => {
    it('should return 200 + stats array', async () => {
      // Create Tours
      await Tour.create([
        createTourInput(),
        createTourInput(),
        createTourInput()
      ])

      // Get Stats
      const { body } = await supertest(app)
        .get('/api/v1/tours/stats')
        .expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            stats: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.stringMatching(
                  new RegExp(`^(${TOUR_DIFFICULTY.join('|')})$`)
                ),
                avgRating: expect.any(Number),
                avgPrice: expect.any(Number),
                minPrice: expect.any(Number),
                maxPrice: expect.any(Number),
                totalRatingsCount: expect.any(Number),
                totalToursCount: expect.any(Number)
              })
            ])
          })
        })
      )
    })
  })

  describe(`Get tours' monthly stats route`, () => {
    // Create Tours
    beforeEach(async () => {
      await Tour.create([
        createTourInput(),
        createTourInput(),
        createTourInput()
      ])
    })

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

      it('should return 200 + stats array', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/tours//monthly-stats/2024`)
          .set('Cookie', adminAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              stats: expect.arrayContaining([
                expect.objectContaining({
                  toursStartcount: expect.any(Number),
                  tours: expect.any(Array),
                  month: expect.any(Number)
                })
              ])
            })
          })
        )
      })
    })

    describe('When Lead-Guide is logged in', () => {
      // Lead-Guide Login
      let leadGuide: IUserDocument | null = null
      let leadGuideAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Lead-Guide using Service
        leadGuide = await createUserAs({ as: 'lead-guide' })
        // Login as Lead-Guide using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: leadGuide as IUserDocument,
          app
        })

        leadGuideAccessTokenCookie = accessTokenCookie
      })

      it('should return 200 + stats array', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/tours//monthly-stats/2024`)
          .set('Cookie', leadGuideAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              stats: expect.arrayContaining([
                expect.objectContaining({
                  toursStartcount: expect.any(Number),
                  tours: expect.any(Array),
                  month: expect.any(Number)
                })
              ])
            })
          })
        )
      })
    })

    describe('When Guide is logged in', () => {
      // Guide Login
      let guide: IUserDocument | null = null
      let guideAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Guide using Service
        guide = await createUserAs({ as: 'guide' })
        // Login as Guide using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: guide as IUserDocument,
          app
        })

        guideAccessTokenCookie = accessTokenCookie
      })

      it('should return 200 + stats array', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/tours//monthly-stats/2024`)
          .set('Cookie', guideAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              stats: expect.arrayContaining([
                expect.objectContaining({
                  toursStartcount: expect.any(Number),
                  tours: expect.any(Array),
                  month: expect.any(Number)
                })
              ])
            })
          })
        )
      })
    })

    describe('When User is logged in', () => {
      // User Login
      let user: IUserDocument | null = null
      let userAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create User using Service
        user = await createUserAs({ as: 'user' })
        // Login as User using route handler
        const { accessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        userAccessTokenCookie = accessTokenCookie
      })

      it('should return 403 + correct error message', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/tours//monthly-stats/2024`)
          .set('Cookie', userAccessTokenCookie)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe(
          "Unauthorized - You don't have permissions. Access restricted to admin, lead-guide, guide."
        )
      })
    })

    describe('When NO User is logged in', () => {
      it('should return 401 + correct error message', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/tours/monthly-stats/2024`)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })

  describe('Get Tours Within route', () => {
    it('should return 200 + tours array', async () => {
      // Create Tours
      await Tour.create([
        createTourInput(),
        createTourInput(),
        createTourInput()
      ])

      // Get Tours
      const { body } = await supertest(app)
        .get('/api/v1/tours/within/400/center/51,-115/unit/mi')
        .expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            tours: expect.arrayContaining([
              expect.objectContaining({
                startLocation: expect.any(Object),
                _id: expect.any(String),
                name: expect.any(String),
                duration: expect.any(Number),
                maxGroupSize: expect.any(Number),
                difficulty: expect.stringMatching(
                  new RegExp(`^(${TOUR_DIFFICULTY.join('|')})$`)
                ),
                ratingsAverage: expect.any(Number),
                ratingsCount: expect.any(Number),
                price: expect.any(Number),
                summary: expect.any(String),
                description: expect.any(String),
                imageCover: expect.any(String),
                images: expect.any(Array),
                startDates: expect.any(Array),
                locations: expect.any(Array),
                guides: expect.any(Array),
                updatedAt: expect.any(String)
              })
            ])
          })
        })
      )
    })
  })

  describe('Get Distances route', () => {
    it('should return 200 + distances array', async () => {
      // Create Tours
      await Tour.create([
        createTourInput(),
        createTourInput(),
        createTourInput()
      ])

      // Get Distances
      const { body } = await supertest(app)
        .get('/api/v1/tours/distances-from/51,-115/unit/mi')
        .expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            distances: expect.arrayContaining([
              expect.objectContaining({
                _id: expect.any(String),
                name: expect.any(String),
                distance: expect.any(Number)
              })
            ])
          })
        })
      )
    })
  })
})
