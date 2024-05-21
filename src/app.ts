import 'dotenv/config'
import path from 'path'
import config from 'config'
import logger from './utils/logger.utils'
import createServer from './utils/createServer.utils'
import connectDb from './utils/connectDB.utils.'
import errorMiddleware from './middleware/errorMiddleware'

// Set NODE_CONFIG_DIR
process.env['NODE_CONFIG_DIR'] = path.join(path.resolve('./'), 'config/')

const port = config.get<number>('port')

const app = createServer()

app.listen(port, async () => {
  await connectDb()

  logger.info(`App running at http://localhost:${port}`)

  // Error handler middleware
  app.use(errorMiddleware)
})

export default app
