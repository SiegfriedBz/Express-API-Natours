import 'dotenv/config'
import config from 'config'
import mongoose from 'mongoose'
import User from '../../src/models/user.model'
import Tour from '../../src/models/tour.model'
import Review from '../../src/models/review.model'
import Booking from '../../src/models/booking.model'

import logger from '../../src/utils/logger.utils'
import { readFilePromise } from '../../src/utils/fs.utils'
import type { TCreateTourInput } from '../../src/zodSchema/tour.zodSchema'
import type { TCreateUserInput } from '../../src/zodSchema/user.zodSchema'
import type { TCreateReviewInput } from '../../src/zodSchema/review.zodSchema'

type TCreateTourSeed = {
  _id: string
} & TCreateTourInput['body']

type TCreateUserSeed = {
  _id: string
} & TCreateUserInput['body']

type TCreateReviewSeed = {
  _id: string
} & TCreateReviewInput['body']

type TCreateBookingSeed = { price: number; user: string; tour: string }

const ENV = process.env.NODE_ENV
const dbUri = config.get<string>('dbUri')

const seed = async () => {
  /** 1. connect to MongoDB */
  const connected = await mongoose.connect(dbUri)

  if (!connected) throw new Error('❌ DB connection failed')

  logger.info(`✅ ${ENV} DB connection successful`)

  /** 2. Delete Tours in DB */
  logger.info('Deleting tours...')
  await Tour.deleteMany()
  logger.info('✅ Deleting tours..DONE')

  /** 3. get data from fs */
  const toursDataJson = await readFilePromise('dev-data/data/tours.json')

  const toursData = JSON.parse(toursDataJson)

  /** 4. Seed Tours in DB */
  logger.info('Seeding tours...')
  const newToursPromises = toursData.map((tour: TCreateTourSeed) =>
    Tour.create(tour)
  )
  await Promise.all(newToursPromises)
  logger.info('✅ Seeding tours..DONE')

  logger.info('======')

  // /** 5. Delete Users in DB */
  logger.info('Deleting users...')
  await User.deleteMany()
  logger.info('✅ Deleting users..DONE')

  /** 6. get  data from fs */
  const usersDataJson = await readFilePromise('dev-data/data/users.json')

  const usersData = JSON.parse(usersDataJson)

  /** 7. Seed Users in DB */
  logger.info('Seeding users...')
  const newUsersPromises = usersData.map((user: TCreateUserSeed) =>
    User.create(user)
  )
  await Promise.all(newUsersPromises)
  logger.info('✅ Seeding users...DONE')

  logger.info('======')

  /** 5. Delete Reviews in DB */
  logger.info('Deleting reviews...')
  await Review.deleteMany()
  logger.info('✅ Deleting reviews...DONE')

  /** 6. get data from fs */
  const reviewsDataJson = await readFilePromise('dev-data/data/reviews.json')

  const reviewsData = JSON.parse(reviewsDataJson)

  /** 7. Seed Reviews in DB */
  logger.info('Seeding reviews...')
  const newReviewsPromises = reviewsData.map((review: TCreateReviewSeed) =>
    Review.create(review)
  )
  await Promise.all(newReviewsPromises)
  logger.info('✅ Seeding reviews...DONE')

  logger.info('======')

  /** 8. Delete Bookings in DB */
  logger.info('Deleting bookings...')
  await Booking.deleteMany()
  logger.info('✅ Deleting bookings...DONE')

  /** 9. get data from fs */
  const bookingsDataJson = await readFilePromise('dev-data/data/bookings.json')

  const bookingsData = JSON.parse(bookingsDataJson)

  /** 10. Seed bookings in DB */
  logger.info('Seeding bookings...')
  const newBookingsPromises = bookingsData.map((booking: TCreateBookingSeed) =>
    Booking.create(booking)
  )
  await Promise.all(newBookingsPromises)
  logger.info('✅ Seeding bookings...DONE')
}

seed()
  .then(() => {
    logger.info('===')
    logger.info(
      `🚀 Cleaning ${ENV} DB & Seeding Tours, Users, Reviews and Bookings...DONE`
    )
    mongoose.disconnect()
    mongoose.connection.close()
    process.exit(0)
  })
  .catch((err) => {
    logger.error(err.message)
    mongoose.disconnect()
    mongoose.connection.close()
    process.exit(1)
  })
