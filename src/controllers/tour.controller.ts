import {
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyStats,
  getTour,
  getToursStats,
  getToursWithin,
  updateTour
} from '../services/tour.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { NextFunction, Request, Response } from 'express'
import type {
  TCreateTourInput,
  TUpdateTourInput
} from '../zodSchema/tour.zodSchema'
import type { ITourDocument } from '../types/tour.types'

export const getAllToursHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req

    const tours: ITourDocument[] = await getAllTours(query)

    return res.status(200).json({
      status: 'success',
      dataCount: tours?.length,
      data: { tours }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

export const getTourHandler = async (
  req: Request<{ tourId: string }, object, object>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { tourId }
    } = req

    const tour: ITourDocument | null = await getTour(tourId)

    if (!tour) {
      return next(new AppError({ statusCode: 404, message: 'Tour not found' }))
    }

    return res.status(200).json({
      status: 'success',
      data: { tour }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin & Lead-Guide
 */
export const createTourHandler = async (
  req: Request<object, object, TCreateTourInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req

    // 1. Get all file names (if any) from prev middleware
    const allTourImageFileNames = res.locals.allTourImageFileNames
    const imageCoverName = allTourImageFileNames?.imageCover
    const otherImageNames = allTourImageFileNames?.images

    // 2. Populate data for update
    const data = {
      ...body,
      ...(imageCoverName ? { imageCover: imageCoverName } : {}),
      ...(otherImageNames ? { images: otherImageNames } : {})
    }

    // 3. Create tour
    const newTour = await createTour(data)

    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin & Lead-Guide
 */
export const updateTourHandler = async (
  req: Request<TUpdateTourInput['params'], object, TUpdateTourInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { tourId },
      body
    } = req

    // 1. Get all file names (if any) from multer upload middleware
    const allTourImageFileNames = res.locals.allTourImageFileNames
    const imageCoverName = allTourImageFileNames?.imageCover
    const otherImageNames = allTourImageFileNames?.images

    // 2. Populate data for update
    const data = {
      ...body,
      ...(imageCoverName ? { imageCover: imageCoverName } : {}),
      ...(otherImageNames ? { images: otherImageNames } : {})
    }

    // 3. Update tour
    const updatedTour = await updateTour({ _id: tourId }, data)

    if (!updatedTour) {
      return next(new AppError({ statusCode: 404, message: 'Tour not found' }))
    }

    return res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Protected
 *  Admin & Lead-Guide
 */
export const deleteTourHandler = async (
  req: Request<{ tourId: string }, object, object>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { tourId }
    } = req

    const deletetedTour = await deleteTour(tourId)

    if (!deletetedTour) {
      return next(new AppError({ statusCode: 404, message: 'Tour not found' }))
    }

    return res.status(204).send()
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Stats */
export const getToursStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getToursStats()

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

export const getToursMonthlyStatsHandler = async (
  req: Request<{ year: string }, object, object>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { year }
    } = req

    const stats = await getMonthlyStats(Number(year))

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/** Geo */
export const getToursWithinHandler = async (
  req: Request<
    { distance: string; latlng: string; unit: string },
    object,
    object
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { distance, latlng, unit }
    } = req

    const tours = await getToursWithin({ distance, latlng, unit })

    return res.status(200).json({
      status: 'success',
      data: {
        tours
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

export const getDistancesHandler = async (
  req: Request<{ latlng: string; unit: string }, object, object>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      params: { latlng, unit }
    } = req

    const distances = await getDistances({ latlng, unit })

    return res.status(200).json({
      status: 'success',
      data: {
        distances
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}
