import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError'
import type { TCreateUserInput } from '../zodSchema/user.zodSchema'

export async function createUser(inputData: TCreateUserInput['body']) {
  try {
    const newUser = await User.create(inputData)

    return omit(newUser.toJSON(), 'password')
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new AppError({ statusCode: 409, message: err.message })
    } else {
      throw err
    }
  }
}
