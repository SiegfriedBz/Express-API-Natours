import { MongoMemoryServer } from 'mongodb-memory-server'
import { handleMongoTestServer } from './utils.ts/handleMongoTestServer.utils'
import supertest from 'supertest'
import createServer from '../utils/createServer.utils'
import Booking from '../models/booking.model'
import { createUserAs } from './utils.ts/createUserAs.utils'
import { loginAs } from './utils.ts/loginAs.utils'
import { createBooking } from './utils.ts/createBooking'
import { IBookingDocument } from '../types/booking.types'
import { IUserDocument } from '../types/user.types'
import { ITourDocument } from '../types/tour.types'
import { createTour } from './utils.ts/createTour.utils'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('Bookings routes', () => {
  handleMongoTestServer({ mongoTestServer, app })

  describe('Get All Bookings route', () => {
    const numOfBookings = 4

    beforeEach(async () => {
      // Clean DB + create bookings
      await Booking.deleteMany()
      await Promise.all(
        Array.from({ length: numOfBookings }, () => {
          createBooking()
        })
      )
    })

    describe('When Admin is logged in', () => {
      it('should send 200 + array of bookings with populated user and tour', async () => {
        const admin = await createUserAs({ as: 'admin' })
        const { accessTokenCookie: adminAccessTokenCookie } = await loginAs({
          asDocument: admin,
          app
        })

        const { body } = await supertest(app)
          .get('/api/v1/bookings')
          .set('Cookie', adminAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            dataCount: numOfBookings,
            data: expect.objectContaining({
              bookings: expect.arrayContaining([
                expect.objectContaining({
                  price: expect.any(Number),
                  user: expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String)
                  }),
                  tour: expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String),
                    price: expect.any(Number)
                  })
                })
              ])
            })
          })
        )
      })
    })

    describe('When User is logged in', () => {
      it('should send 403 + correct error message', async () => {
        const user = await createUserAs({ as: 'user' })
        const { accessTokenCookie: userAccessTokenCookie } = await loginAs({
          asDocument: user,
          app
        })

        const { body } = await supertest(app)
          .get('/api/v1/bookings')
          .set('Cookie', userAccessTokenCookie)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe(
          "Unauthorized - You don't have permissions. Access restricted to admin."
        )
      })
    })
  })

  describe('Get All Bookings on 1 Tour route', () => {
    // // Clean DB + Create 4 bookings for 1 user / 1 tour
    const numOfBookings = 4

    let booker: IUserDocument | null = null
    let tour: ITourDocument | null = null

    beforeEach(async () => {
      await Booking.deleteMany()
      booker = await createUserAs({ as: 'user' })
      tour = await createTour()

      await Promise.all(
        Array.from({ length: numOfBookings }, () => {
          return createBooking({
            userId: booker?._id,
            tourId: tour?._id,
            price: tour?.price
          })
        })
      )
    })

    describe('When Admin is logged in', () => {
      it('should send 200 + array of bookings for this tour', async () => {
        const admin = await createUserAs({ as: 'admin' })
        const { accessTokenCookie: adminAccessTokenCookie } = await loginAs({
          asDocument: admin,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/tours/${tour?._id}/bookings`)
          .set('Cookie', adminAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            dataCount: numOfBookings,
            data: expect.objectContaining({
              bookings: expect.arrayContaining([
                expect.objectContaining({
                  price: expect.any(Number),
                  user: expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String)
                  }),
                  tour: expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String),
                    price: expect.any(Number)
                  })
                })
              ])
            })
          })
        )
      })
    })

    describe('When User is logged in', () => {
      it('should send 403 + correct error message', async () => {
        const user = await createUserAs({ as: 'user' })
        const { accessTokenCookie: userAccessTokenCookie } = await loginAs({
          asDocument: user,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/tours/${tour?._id}/bookings`)
          .set('Cookie', userAccessTokenCookie)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe(
          "Unauthorized - You don't have permissions. Access restricted to admin."
        )
      })
    })
  })

  describe('Get 1 Booking route', () => {
    let booker: IUserDocument | null = null
    let tour: ITourDocument | null = null
    let booking: IBookingDocument | null = null

    beforeEach(async () => {
      booker = await createUserAs({ as: 'user' })
      tour = await createTour()
      booking = await createBooking({
        userId: booker._id,
        tourId: tour._id,
        price: tour.price
      })
    })

    describe('When Admin is logged in', () => {
      it('should send 200 + booking', async () => {
        const admin = await createUserAs({ as: 'admin' })
        const { accessTokenCookie: adminAccessTokenCookie } = await loginAs({
          asDocument: admin,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/bookings/${booking?._id}`)
          .set('Cookie', adminAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              booking: expect.objectContaining({
                price: expect.any(Number),
                user: expect.objectContaining({
                  _id: expect.any(String),
                  name: expect.any(String)
                }),
                tour: expect.objectContaining({
                  _id: expect.any(String),
                  name: expect.any(String),
                  price: expect.any(Number)
                })
              })
            })
          })
        )
      })
    })

    describe('When the Booker is logged in', () => {
      it('should send 200 + booking', async () => {
        const { accessTokenCookie: bookerAccessTokenCookie } = await loginAs({
          asDocument: booker as IUserDocument,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/bookings/${booking?._id}`)
          .set('Cookie', bookerAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              booking: expect.objectContaining({
                price: expect.any(Number),
                user: expect.objectContaining({
                  _id: expect.any(String),
                  name: expect.any(String)
                }),
                tour: expect.objectContaining({
                  _id: expect.any(String),
                  name: expect.any(String),
                  price: expect.any(Number)
                })
              })
            })
          })
        )
      })
    })

    describe('When a user NON-Booker is logged in', () => {
      it('should send 403 + correct error message', async () => {
        const user = await createUserAs({ as: 'user' })
        const { accessTokenCookie: userAccessTokenCookie } = await loginAs({
          asDocument: user as IUserDocument,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/bookings/${booking?._id}`)
          .set('Cookie', userAccessTokenCookie)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe(
          'You can only check a booking that you booked yourself, or you need to be Admin'
        )
      })
    })

    describe('When user is NOT logged in', () => {
      it('should send 401 + correct error message', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/bookings/${booking?._id}`)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })

  describe('Get Stripe Checkout Session route', () => {
    let tour: ITourDocument | null = null

    beforeEach(async () => {
      tour = await createTour()
    })

    describe('When User is logged in', () => {
      it('should send 200 + the correct stripe checkout session', async () => {
        const user = await createUserAs({ as: 'user' })
        const { accessTokenCookie: userAccessTokenCookie } = await loginAs({
          asDocument: user,
          app
        })

        const { body } = await supertest(app)
          .get(`/api/v1/bookings/checkout-session/${tour?._id}`)
          .set('Cookie', userAccessTokenCookie)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              stripeSession: expect.objectContaining({
                id: expect.any(String),
                object: 'checkout.session',
                client_reference_id: expect.any(String),
                created: expect.any(Number),
                currency: 'usd',
                customer_email: user?.email,
                expires_at: expect.any(Number),
                livemode: false,
                metadata: {},
                mode: 'payment',
                payment_status: 'unpaid',
                status: 'open',
                success_url: expect.stringMatching(new RegExp(`my-bookings`)),
                cancel_url: expect.stringMatching(
                  new RegExp(`\\/tours\\/${tour?._id.toString()}`)
                ),
                ui_mode: 'hosted',
                url: expect.any(String)
              })
            })
          })
        )
      })
    })

    describe('When User is NOT logged in', () => {
      it('should send 401 + the correct error message', async () => {
        const { body } = await supertest(app)
          .get(`/api/v1/bookings/checkout-session/${tour?._id}`)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })
})
