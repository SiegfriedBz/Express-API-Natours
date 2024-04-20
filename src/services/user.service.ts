import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import type {
  TAdminUpdateUserInput,
  TCreateUserInput,
  TUpdateMeInput
} from '../zodSchema/user.zodSchema'
import type { IUserDocument } from '../types/user.types'

type TUserWithoutPassword = Omit<IUserDocument, 'password'>

export async function createUser(
  inputData: TCreateUserInput['body']
): Promise<TUserWithoutPassword | null> {
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

export async function updateUser(
  filter: FilterQuery<IUserDocument>,
  update: UpdateQuery<TAdminUpdateUserInput['body'] | TUpdateMeInput['body']>
): Promise<TUserWithoutPassword | null> {
  // TODO USE .select("-password")
  const updatedUser = await User.findOneAndUpdate(filter, update, { new: true })

  return updatedUser
    ? (omit(updatedUser.toObject(), 'password') as unknown as Omit<
        IUserDocument,
        'password'
      >)
    : null
}

export async function getAllUsers(): Promise<TUserWithoutPassword[] | null> {
  const users = await User.find().select('-password')

  return users
}

export async function getUser(
  userId: string
): Promise<TUserWithoutPassword | null> {
  const user = await User.findById(userId).select('-password')

  return user
}

/** Helpers */
// Check email/password and return user
type TPropsCheckPassword = {
  email: string
  password: string
}

export async function checkPassword({
  email,
  password
}: TPropsCheckPassword): Promise<IUserDocument | null> {
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
