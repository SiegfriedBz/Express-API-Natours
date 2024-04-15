import 'dotenv/config'
import config from 'config'
import logger from './utils/logger'
import createServer from './utils/createServer'
import connectDb from './utils/connectDB'
import errorMiddleware from './utils/errorMiddleware'

const port = config.get<number>('port')

const app = createServer()

app.listen(port, async () => {
  await connectDb()

  logger.info(`App running at http://localhost:${port}`)

  // Error handler middleware
  app.use(errorMiddleware)
})

export default app
