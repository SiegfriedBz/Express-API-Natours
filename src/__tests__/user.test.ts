import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import errorMiddleware from '../middleware/errorMiddleware'
import createServer from '../utils/createServer.utils'
import userInputFixture from './fixtures/user/userInput.fixture'

interface IUserInputData {
  name: string
  email: string
  password: string
  passwordConfirmation?: string
}

const app = createServer()

let mongoTestServer: MongoMemoryServer

describe('User routes', () => {
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

  describe('Create user route - sign up', () => {
    const userInput: IUserInputData = {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }

    beforeEach(() => {
      const { name, email, password } = userInputFixture()
      userInput.name = name
      userInput.email = email
      userInput.password = password
      userInput.passwordConfirmation = password
    })

    describe('with a valid input', () => {
      it('should return 201 + user', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(userInput)
          .expect(201)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              user: expect.objectContaining({
                name: userInput.name,
                email: userInput.email
              })
            })
          })
        )
      })
    })

    describe('when passwords do not match', () => {
      it('should return 400 + correct error message', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send({
            ...userInput,
            passwordConfirmation: 'WRONG_PSWD'
          })
          .expect(400)

        expect(body.error.message).toContain('Passwords do not match')
      })
    })

    describe('with missing passwordConfirmation input', () => {
      it('should return 400 + correct error message', async () => {
        const invalidUserInput = userInput
        delete invalidUserInput.passwordConfirmation

        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(invalidUserInput)
          .expect(400)

        expect(body.error.message).toContain('passwordConfirmation is required')
      })
    })
  })
})
