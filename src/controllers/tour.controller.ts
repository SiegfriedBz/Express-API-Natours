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

/**
 * Handler function to get all tours.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the status, data count, and tours.
 */
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

/**
 * Get tour handler function.
 * Retrieves a tour by its ID and sends a JSON response with the tour data.
 *
 * @param req - Express request object with tourId parameter.
 * @param res - Express response object.
 * @param next - Express next function.
 */
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
/**
 * Handles the creation of a new tour.
 *
 * @param req - The request object containing the tour data in the body.
 * @param res - The response object used to send the response.
 * @param next - The next function to call in the middleware chain.
 * @returns A JSON response with the newly created tour.
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
      ...(otherImageNames?.length > 0 ? { images: otherImageNames } : {})
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
/**
 * Update tour handler.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A JSON response with the updated tour data.
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
      ...(otherImageNames?.length > 0 ? { images: otherImageNames } : {})
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
/**
 * Handles the deletion of a tour.
 *
 * @param req - The request object containing the tourId parameter.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 * @returns A response with status 204 if the tour is successfully deleted.
 * @throws AppError if the tour is not found.
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
/**
 * Handler function for getting tour statistics.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
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

/**
 * Handler function for getting monthly statistics for tours.
 *
 * @param req - The request object containing the year parameter.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 * @returns A JSON response with the monthly statistics for tours.
 */
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
/**
 * Handler function to get tours within a certain distance from a given location.
 *
 * @param req - The request object containing the distance, latlng, and unit parameters.
 * @param res - The response object to send the result.
 * @param next - The next function to call in the middleware chain.
 * @returns A JSON response with the status and data containing the tours within the specified distance.
 */
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
      params: { distance, latlng, unit },
      query
    } = req

    const tours: ITourDocument[] = await getToursWithin({
      distance,
      latlng,
      unit,
      query
    })

    return res.status(200).json({
      status: 'success',
      dataCount: tours?.length,
      data: {
        tours
      }
    })
  } catch (err: unknown) {
    logger.error(err)
    next(err)
  }
}

/**
 * Handler function for getting distances.
 *
 * @param req - The request object containing the latitude and longitude coordinates and the unit of measurement.
 * @param res - The response object.
 * @param next - The next function to be called in the middleware chain.
 * @returns A JSON response with the distances.
 */
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
