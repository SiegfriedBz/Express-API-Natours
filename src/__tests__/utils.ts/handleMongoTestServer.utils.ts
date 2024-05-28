import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import errorMiddleware from '../../middleware/errorMiddleware'
import type { Express } from 'express'
import AppError from '../../utils/AppError.utils'

type TProps = {
  app: Express
  mongoTestServer: MongoMemoryServer
}

export const handleMongoTestServer = ({ app, mongoTestServer }: TProps) => {
  beforeAll(async () => {
    try {
      mongoTestServer = await MongoMemoryServer.create()

      await new Promise((resolve, reject) => {
        mongoose.connection.on('connected', resolve)
        mongoose.connection.on('error', reject)
        mongoose.connect(mongoTestServer.getUri())
      })
    } catch (error) {
      const err = error as Error
      throw new AppError({
        message: `Error connecting to MongoDB: ${err.message}`,
        statusCode: 500
      })
    }

    // Error handler middleware
    app.use(errorMiddleware)
  })
  afterAll(async () => {
    await mongoose.disconnect()
    await mongoTestServer.stop()
  })
}
