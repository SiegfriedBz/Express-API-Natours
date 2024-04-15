import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import supertest from 'supertest'
import errorMiddleware from '../utils/errorMiddleware'
import createServer from '../utils/createServer'
import userInputFixture from './fixtures/user/userInput.fixture'

const app = createServer()

describe('User routes', () => {
  beforeAll(async () => {
    const mongoTestServer = await MongoMemoryServer.create()

    await mongoose.connect(mongoTestServer.getUri())

    // Error handler middleware
    app.use(errorMiddleware)
  })
  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('Create user route - sign up', () => {
    type TInputData = {
      name: string
      email: string
      password: string
      passwordConfirmation?: string
    }
    const inputData: TInputData = {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    }

    beforeEach(() => {
      const { name, email, password } = userInputFixture()
      inputData.name = name
      inputData.email = email
      inputData.password = password
      inputData.passwordConfirmation = password
    })

    describe('with a valid input', () => {
      it('should return 201 + user', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(inputData)
          .expect(201)

        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              user: expect.objectContaining({
                name: inputData.name,
                email: inputData.email
              })
            })
          })
        )
      })
    })

    describe('when passwords do not match', () => {
      it('should return 400 + error message', async () => {
        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send({
            ...inputData,
            passwordConfirmation: 'WRONG_PSWD'
          })
          .expect(400)

        expect(body.error.message).toContain('Passwords do not match')
      })
    })

    describe('with missing passwordConfirmation input', () => {
      it('should return 400 + error message', async () => {
        const invalidInputData = inputData
        delete invalidInputData.passwordConfirmation

        // Create user
        const { body } = await supertest(app)
          .post('/api/users')
          .send(invalidInputData)
          .expect(400)

        expect(body.error.message).toContain('passwordConfirmation is required')
      })
    })
  })
})
