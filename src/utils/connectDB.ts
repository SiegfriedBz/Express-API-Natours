import mongoose from 'mongoose'
import config from 'config'
import logger from './logger'

async function connectDb() {
  const ENV = process.env.NODE_ENV
  const dbUri = config.get<string>('dbUri')

  try {
    logger.info(`Connecting to ${ENV} DB...`)
    await mongoose.connect(dbUri)
    logger.info(`Connected to ${ENV} DB`)
  } catch (error) {
    logger.error(`Could not connect to ${ENV} DB`)
    process.exit(1)
  }
}

export default connectDb
