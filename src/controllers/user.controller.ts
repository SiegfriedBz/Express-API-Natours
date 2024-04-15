import { createUser } from '../services/user.service'
import type { Request, Response, NextFunction } from 'express'
import type { TCreateUserInput } from '../zodSchema/user.zodSchema'

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
