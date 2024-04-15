import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError'
import type { TCreateUserInput } from '../zodSchema/user.zodSchema'
import logger from '../utils/logger'

export async function createUser(inputData: TCreateUserInput['body']) {
  try {
    logger.info({ createUserinputData: inputData })
    const newUser = await User.create(inputData)

    return omit(newUser.toJSON(), 'password')
  } catch (err: unknown) {
    logger.info({ err })
    if (err instanceof Error) {
      throw new AppError({ statusCode: 409, message: err.message })
    } else {
      throw err
    }
  }
}
