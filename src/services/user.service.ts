import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import type { TCreateUserInput } from '../zodSchema/user.zodSchema'
import type { IUserDBInput, IUserDocument } from '../types/user.types'

type TReturnUserWithoutPassword = Promise<Omit<
  IUserDocument,
  'password'
> | null>

export async function getUser(userId: string): TReturnUserWithoutPassword {
  const user = await User.findById(userId)

  return user
    ? (omit(user.toObject(), 'password') as unknown as Omit<
        IUserDocument,
        'password'
      >)
    : null
}
/** Signup */
export async function createUser(
  inputData: TCreateUserInput['body']
): TReturnUserWithoutPassword {
  try {
    const newUser = await User.create(inputData)

    return newUser
      ? (omit(newUser.toObject(), 'password') as unknown as Omit<
          IUserDocument,
          'password'
        >)
      : null
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new AppError({ statusCode: 409, message: err.message })
    } else {
      throw err
    }
  }
}

/** Admin Or User update user */
export async function updateUser(
  filter: FilterQuery<IUserDocument>,
  update: UpdateQuery<IUserDBInput>
): TReturnUserWithoutPassword {
  const updatedUser = await User.findOneAndUpdate(filter, update, { new: true })

  return updatedUser
    ? (omit(updatedUser.toObject(), 'password') as unknown as Omit<
        IUserDocument,
        'password'
      >)
    : null
}

/** Check email/password and return user */
type TReturnCheckPassword = Promise<IUserDocument | null>
export async function checkPassword({
  email,
  password
}: {
  email: string
  password: string
}): TReturnCheckPassword {
  const user = await User.findOne({ email })

  if (!user) {
    return null
  }

  const isValid = await (user as IUserDocument).comparePassword(password)
  if (!isValid) {
    return null
  }

  return user
}
