import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import errorMiddleware from '../../middleware/errorMiddleware'
import type { Express } from 'express'

type TProps = {
  app: Express
  mongoTestServer: MongoMemoryServer
}

export const handleMongoTestServer = ({ app, mongoTestServer }: TProps) => {
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
}
