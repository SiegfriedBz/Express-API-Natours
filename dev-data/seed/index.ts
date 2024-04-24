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
import type { ITourDocument } from '../../src/types/tour.types'
import type { IUserDocument } from '../../src/types/user.types'
import type { IReviewDocument } from '../../src/types/review.types'
import type { IBookingDocument } from '../../src/types/booking.types'

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
  /** 1. Connect to MongoDB */
  logger.info(`*******`)
  logger.info(`Connecting to ${ENV} DB...`)
  const connected = await mongoose.connect(dbUri)

  if (!connected) throw new Error('❌ DB connection failed')

  logger.info(`🚀 ${ENV} DB connection successful`)

  /** 2. Delete & Seed Tours */
  await seedModel<ITourDocument, TCreateTourSeed>({
    Model: Tour as mongoose.Model<ITourDocument>,
    name: 'tours'
  })

  /** 3. Delete & Seed Users */
  await seedModel<IUserDocument, TCreateUserSeed>({
    Model: User as mongoose.Model<IUserDocument>,
    name: 'users'
  })

  /** 4. Delete & Seed Reviews */
  await seedModel<IReviewDocument, TCreateReviewSeed>({
    Model: Review as mongoose.Model<IReviewDocument>,
    name: 'reviews'
  })

  /** 5. Delete & Seed Bookings */
  await seedModel<IBookingDocument, TCreateBookingSeed>({
    Model: Booking as mongoose.Model<IBookingDocument>,
    name: 'bookings'
  })
}

seed()
  .then(() => {
    logger.info(`*******`)
    logger.info(
      `🚀 Cleaning ${ENV} DB & Seeding Tours, Users, Reviews and Bookings...DONE`
    )
    logger.info(`*******`)
    logger.info(`*******`)
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

/** Helper */
type TSeedModelProps<T, U> = {
  Model: mongoose.Model<T>
  name: string
  _dummy?: U
}

const seedModel = async <T, U>({ Model, name }: TSeedModelProps<T, U>) => {
  logger.info(`*******`)
  /** 1. Delete */
  logger.info(`Deleting ${name}...`)
  await Model.deleteMany()
  logger.info(`'✅ Deleting ${name}..DONE'`)

  /** 2. Get data from fs */
  const dataJson = await readFilePromise(`dev-data/data/${name}.json`)
  const data: U[] = JSON.parse(dataJson)

  /** 3. Seed */
  logger.info(`Seeding ${name}...`)
  const promises = data.map((item: U) => Model.create(item))
  await Promise.all(promises)
  logger.info(`'✅ Seeding ${name}..DONE'`)
  logger.info(`*******`)
}
