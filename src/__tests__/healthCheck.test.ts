import supertest from 'supertest'
import createServer from '../utils/createServer'
import errorMiddleware from '../utils/errorMiddleware'

const app = createServer()
beforeAll(() => {
  // Error handler middleware
  app.use(errorMiddleware)
})

describe('Healthcheck route', () => {
  it('should return 200', async () => {
    await supertest(app).get('/api/healthcheck').expect(200)
  })
})
