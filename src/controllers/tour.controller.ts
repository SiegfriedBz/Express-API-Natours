import { createTour } from '../services/tour.service'
import type { NextFunction, Request, Response } from 'express'
import type { TCreateTourInput } from '../zodSchema/tour.zodSchema'

export const createTourHandler = async (
  req: Request<object, object, TCreateTourInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req

    const newTour = await createTour(body)

    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  } catch (error) {
    next(error)
  }
}
