import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import type { TCreateUserInput } from '../zodSchema/user.zodSchema'
import type { IUserDBInput, IUserDocument } from '../types/user.types'

export async function getUser(userId: string) {
  const user = await User.findById(userId)

  return user
}
/** Signup */
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

/** Admin update user */
export async function updateUser(
  filter: FilterQuery<IUserDocument>,
  update: UpdateQuery<IUserDBInput>
) {
  const updatedUser = await User.findOneAndUpdate(filter, update, { new: true })

  return updatedUser ? omit(updatedUser.toObject(), 'password') : null
}

export async function checkPassword({
  email,
  password
}: {
  email: string
  password: string
}): Promise<Omit<IUserDocument, 'password' | 'comparePassword'> | null> {
  const user = await User.findOne({ email })

  if (!user) {
    return null
  }

  const isValid = await (user as IUserDocument).comparePassword(password)
  if (!isValid) {
    return null
  }

  const userWithoutPassword = user.toObject({
    transform: (doc, ret) => {
      delete ret.password
      delete ret.comparePassword
      return ret
    }
  }) as Omit<IUserDocument, 'password' | 'comparePassword'>

  return userWithoutPassword
}
