import 'dotenv/config'
import config from 'config'
import logger from './utils/logger'
import createServer from './utils/createServer'
import connectDb from './utils/connectDB'

const port = config.get<number>('port')

const app = createServer()

app.listen(port, async () => {
  await connectDb()

  logger.info(`App running at http://localhost:${port}`)
})

export default app
