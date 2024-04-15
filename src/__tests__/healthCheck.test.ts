import supertest from 'supertest'
import createServer from '../utils/createServer'

const app = createServer()

describe('Healthcheck route', () => {
  it('should return 200', async () => {
    await supertest(app).get('/api/healthcheck').expect(200)
  })
})
