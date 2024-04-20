import supertest from 'supertest'
import createServer from '../utils/createServer.utils'

const app = createServer()

describe('Healthcheck route', () => {
  it('should return 200', async () => {
    await supertest(app).get('/api/v1/healthcheck').expect(200)
  })
})
