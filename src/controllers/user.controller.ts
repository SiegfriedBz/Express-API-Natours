import { createUser, getUser, updateUser } from '../services/user.service'
import type { Request, Response, NextFunction } from 'express'
import type {
  TAdminUpdateUserInput,
  TCreateUserInput
} from '../zodSchema/user.zodSchema'
import AppError from '../utils/AppError.utils'

/** Signup */
export const createUserHandler = async (
  req: Request<object, object, TCreateUserInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req

    const user = await createUser(body)

    return res.status(201).json({
      status: 'success',
      data: { user }
    })
  } catch (err: unknown) {
    next(err)
  }
}

/** Admin update user */
export const updateUserHandler = async (
  req: Request<
    TAdminUpdateUserInput['params'],
    object,
    TAdminUpdateUserInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      body,
      params: { userId }
    } = req

    // Check user exists
    const user = await getUser(userId)

    if (!user) {
      return next(new AppError({ statusCode: 404, message: 'User not found' }))
    }

    // Update user
    const updatedUser = await updateUser({ _id: userId }, body)

    return res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    })
  } catch (err: unknown) {
    next(err)
  }
}
