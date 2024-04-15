import 'dotenv/config'
import config from 'config'
import logger from './utils/logger.utils'
import createServer from './utils/createServer.utils'
import connectDb from './utils/connectDB.utils.'
import errorMiddleware from './middleware/errorMiddleware'

const port = config.get<number>('port')

const app = createServer()

app.listen(port, async () => {
  await connectDb()

  logger.info(`App running at http://localhost:${port}`)

  // Error handler middleware
  app.use(errorMiddleware)
})

export default app
