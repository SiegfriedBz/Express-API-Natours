import { Request, Response, NextFunction } from 'express'
import restrictToRole from './restrictToRole'
import AppError from '../utils/AppError.utils'
import { TUserRole } from '../types/user.types'

describe('restrictToRole middleware', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {} as Request
    res = {} as Response
    next = jest.fn() as NextFunction
  })

  it('should call next() if the user has one of the allowed roles', () => {
    const allowedRoles: TUserRole[] = ['admin', 'lead-guide']
    const userRole: TUserRole = 'admin'

    res.locals = {
      user: {
        role: userRole
      }
    }

    restrictToRole(...allowedRoles)(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalledWith(
      new AppError({
        statusCode: 403,
        message: `Unauthorized - You don't have permissions. Access restricted to ${allowedRoles.join(', ')}.`
      })
    )
  })

  it('should throw an AppError with status code 403 if the user does not have one of the allowed roles', () => {
    const allowedRoles: TUserRole[] = ['admin', 'lead-guide']
    const userRole: TUserRole = 'user'

    res.locals = {
      user: {
        role: userRole
      }
    }

    restrictToRole(...allowedRoles)(req, res, next)

    expect(next).toHaveBeenCalledWith(
      new AppError({
        statusCode: 403,
        message: `Unauthorized - You don't have permissions. Access restricted to ${allowedRoles.join(', ')}.`
      })
    )
  })
})
