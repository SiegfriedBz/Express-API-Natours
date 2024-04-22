import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import supertest from 'supertest'
import createServer from '../utils/createServer.utils'
import { handleMongoTestServer } from './utils.ts/handleMongoTestServer.utils'
import Review from '../models/review.model'
import { createUserAs } from './utils.ts/createUserAs.utils'
import { loginAs } from './utils.ts/loginAs.utils'
import { createTour } from './utils.ts/createTour.utils'
import { createReview } from './utils.ts/createReview.utils'
import { generateReviewInput } from './fixtures/review/generateReviewInput.fixture'
import type { IReviewDocument } from '../types/review.types'
import type { IUserDocument } from '../types/user.types'
import type { ITourDocument } from '../types/tour.types'

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('Reviews routes', () => {
  handleMongoTestServer({ mongoTestServer, app })

  describe('Get All Reviews route', () => {
    const totalNumOfReviews = 4

    beforeEach(async () => {
      // Clean up DB & Create reviews
      await Review.deleteMany()
      await Promise.all(
        Array.from({ length: totalNumOfReviews }, () => {
          return createReview()
        })
      )
    })

    it('should return 200 + array of reviews', async () => {
      const { body } = await supertest(app).get('/api/v1/reviews').expect(200)

      expect(body).toEqual(
        expect.objectContaining({
          status: 'success',
          dataCount: totalNumOfReviews,
          data: expect.objectContaining({
            reviews: expect.arrayContaining([
              expect.objectContaining({
                user: expect.any(String),
                tour: expect.any(String),
                content: expect.any(String),
                rating: expect.any(Number)
              })
            ])
          })
        })
      )
    })
  })

  describe('Get 1 Review by ID route', () => {
    describe('When review exists', () => {
      it('should return 200 + correct review', async () => {
        // Create review
        const review: IReviewDocument = await createReview()

        // Get review
        const { body } = await supertest(app)
          .get(`/api/v1/reviews/${review?._id}`)
          .expect(200)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              review: expect.objectContaining({
                user: review?.user._id.toString(),
                tour: review?.tour._id.toString(),
                content: review?.content,
                rating: review?.rating
              })
            })
          })
        )
      })
    })

    describe('When review does NOT exist', () => {
      it('should return 200 + correct review', async () => {
        const fakeReviewId = new mongoose.Types.ObjectId().toString()

        const { body } = await supertest(app)
          .get(`/api/v1/reviews/${fakeReviewId}`)
          .expect(404)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Review not found')
      })
    })
  })

  describe('Create review on tour route', () => {
    describe('When user is logged in', () => {
      let user: IUserDocument | null = null
      let userAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create User
        user = await createUserAs({ as: 'user' })
        // Login as User
        const { accessTokenCookie } = await loginAs({
          asDocument: user,
          app
        })
        userAccessTokenCookie = accessTokenCookie
      })

      describe('When tour exist', () => {
        let tour: ITourDocument | null = null

        beforeEach(async () => {
          // Create tour
          tour = await createTour()
        })

        describe('When review input data is valid', () => {
          it('should return 201 + the new review', async () => {
            // Get inputData
            const reviewInputData = generateReviewInput({
              userId: user?._id,
              tourId: tour?._id
            })

            console.log('======')
            console.log({ reviewInputData })

            // Create review on tour as User
            const { body } = await supertest(app)
              .post(`/api/v1/tours/${tour?._id}/reviews`)
              .set('Cookie', userAccessTokenCookie)
              .send(reviewInputData)
              .expect(201)

            expect(body).toEqual(
              expect.objectContaining({
                status: 'success',
                data: expect.objectContaining({
                  review: expect.objectContaining({
                    user: user?._id.toString(),
                    tour: tour?._id.toString(),
                    content: reviewInputData.content,
                    rating: reviewInputData.rating
                  })
                })
              })
            )
          })
        })

        describe('When review input data is NOT valid', () => {
          it('should return 400 + correct error message', async () => {
            // Set INAVLID inputData
            const invalidReviewInputData = {
              ...generateReviewInput({
                userId: user?._id,
                tourId: tour?._id
              })
            }
            delete (invalidReviewInputData as { [key: string]: unknown })
              .content

            // Create review on tour as User
            const { body } = await supertest(app)
              .post(`/api/v1/tours/${tour?._id}/reviews`)
              .set('Cookie', userAccessTokenCookie)
              .send(invalidReviewInputData)
              .expect(400)

            expect(body.status).toBe('fail')
            expect(body.error.message).toBe('Review content is required')
          })
        })
      })

      describe('When tour does NOT exist', () => {
        it('should return 404 + correct error message', async () => {
          // Create tour
          const tour: ITourDocument = await createTour()
          // Get inputData
          const reviewInputData = generateReviewInput({
            userId: user?._id,
            tourId: tour?._id
          })

          // Create review on fake tour as User
          const fakeTourId = new mongoose.Types.ObjectId().toString()

          const { body } = await supertest(app)
            .post(`/api/v1/tours/${fakeTourId}/reviews`)
            .set('Cookie', userAccessTokenCookie)
            .send(reviewInputData)
            .expect(404)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Tour not found')
        })
      })
    })

    describe('When user is NOT logged in', () => {
      let user: IUserDocument | null = null

      beforeEach(async () => {
        // Create User
        user = await createUserAs({ as: 'user' })
      })

      describe('When tour exist', () => {
        describe('When review input data is valid', () => {
          it('should return 401 + correct error message', async () => {
            // Create tour
            const tour: ITourDocument = await createTour()
            // Get inputData
            const reviewInputData = generateReviewInput({
              userId: user?._id,
              tourId: tour?._id
            })

            // Create review on tour as NOT LOGGED IN
            const { body } = await supertest(app)
              .post(`/api/v1/tours/${tour?._id}/reviews`)
              .send(reviewInputData)
              .expect(401)

            expect(body.status).toBe('fail')
            expect(body.error.message).toBe(
              'Please login to access this resource'
            )
          })
        })
      })
    })
  })

  describe('Delete review route', () => {
    // Create review
    let review: IReviewDocument | null = null

    beforeEach(async () => {
      review = await createReview()
    })

    describe('When Admin is logged in', () => {
      let adminAccessTokenCookie: string = ''

      beforeEach(async () => {
        // Create Admin
        const admin = await createUserAs({ as: 'admin' })
        // Login as Admin
        const { accessTokenCookie } = await loginAs({
          asDocument: admin,
          app
        })
        adminAccessTokenCookie = accessTokenCookie
      })

      describe('When review exist', () => {
        it('should return a 204', async () => {
          // Delete review as Admin
          await supertest(app)
            .delete(`/api/v1/reviews/${review?._id}`)
            .set('Cookie', adminAccessTokenCookie)
            .expect(204)
        })
      })

      describe('When review does NOT exist', () => {
        it('should return a 404 + correct error message', async () => {
          const fakeReviewId = new mongoose.Types.ObjectId().toString()

          // Delete fakeReviewId as Admin
          const { body } = await supertest(app)
            .delete(`/api/v1/reviews/${fakeReviewId}`)
            .set('Cookie', adminAccessTokenCookie)
            .expect(404)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe('Review not found')
        })
      })
    })

    describe('When User is logged in', () => {
      it('should return a 403 + correct error message', async () => {
        // Create User
        const user = await createUserAs({ as: 'user' })
        // Login as Admin
        const { accessTokenCookie } = await loginAs({
          asDocument: user,
          app
        })
        const userAccessTokenCookie = accessTokenCookie

        // Delete review as User
        const { body } = await supertest(app)
          .delete(`/api/v1/reviews/${review?._id}`)
          .set('Cookie', userAccessTokenCookie)
          .expect(403)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe(
          "Unauthorized - You don't have permissions. Access restricted to admin."
        )
      })
    })

    describe('When user is NOT logged in', () => {
      it('should return a 401 + correct error message', async () => {
        // Delete review as not logged in
        const { body } = await supertest(app)
          .delete(`/api/v1/reviews/${review?._id}`)
          .expect(401)

        expect(body.status).toBe('fail')
        expect(body.error.message).toBe('Please login to access this resource')
      })
    })
  })

  describe('Update review route', () => {
    const updateReviewData = { content: 'Awesome maximus tour', rating: 5 }

    let tour01: ITourDocument | null = null
    let user01: IUserDocument | null = null
    let review01: IReviewDocument | null = null

    let review02: IReviewDocument | null = null

    beforeEach(async () => {
      // Create 1 tour / 1 user / 1 review using tour/user
      tour01 = await createTour()
      user01 = await createUserAs({ as: 'user' })
      review01 = await createReview({
        userId: user01?._id,
        tourId: tour01?._id
      })

      // Auto Create 1 tour / 1 user / 1 review
      review02 = await createReview()
    })

    describe('When User is logged in', () => {
      let user01AccessTokenCookie: string = ''

      beforeEach(async () => {
        const { accessTokenCookie } = await loginAs({
          asDocument: user01 as IUserDocument,
          app
        })
        user01AccessTokenCookie = accessTokenCookie
      })

      describe('When the user did create the review', () => {
        it('should return 200 + the updated review', async () => {
          const { body } = await supertest(app)
            .patch(`/api/v1/reviews/${review01?._id?.toString()}`)
            .set('Cookie', user01AccessTokenCookie)
            .send(updateReviewData)
            .expect(200)

          expect(body).toEqual(
            expect.objectContaining({
              status: 'success',
              data: expect.objectContaining({
                review: expect.objectContaining({
                  content: updateReviewData.content,
                  rating: updateReviewData.rating,
                  user: user01?._id.toString(),
                  tour: tour01?._id.toString()
                })
              })
            })
          )
        })
      })

      describe('When the user did NOT create the review', () => {
        it('should return 403 + the correct error message', async () => {
          const { body } = await supertest(app)
            .patch(`/api/v1/reviews/${review02?._id}`)
            .set('Cookie', user01AccessTokenCookie)
            .send(updateReviewData)
            .expect(403)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'You can only update a review that you wrote yourself'
          )
        })
      })
    })

    describe('When User is NOT logged in', () => {
      describe('When the user did create the review', () => {
        it('should return 401 + the correct error message', async () => {
          const { body } = await supertest(app)
            .patch(`/api/v1/reviews/${review01?._id?.toString()}`)
            .send(updateReviewData)
            .expect(401)

          expect(body.status).toBe('fail')
          expect(body.error.message).toBe(
            'Please login to access this resource'
          )
        })
      })
    })
  })
})
