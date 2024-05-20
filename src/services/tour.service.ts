import Tour from '../models/tour.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import { queryBuilderService } from '../utils/queryBuilder.service.utils'
import type {
  TCreateTourInput,
  TUpdateTourInput
} from '../zodSchema/tour.zodSchema'
import type { ITourDocument } from '../types/tour.types'
import type { Query as ExpressQuery } from 'express-serve-static-core'

const EARTH_RADIUS = {
  mi: 3963.2,
  km: 6378.1
}
const METER_TO = {
  mi: 0.000621371,
  km: 0.001
}

/**
 * Service function to get all tours based on the provided query parameters.
 * @param query - The query parameters.
 * @returns A promise that resolves to an array of tours.
 */
export async function getAllTours(query: ExpressQuery) {
  const tours = await queryBuilderService<ITourDocument>({ query, Model: Tour })

  return tours
}

/**
 * Service function to get a tour by its ID.
 * @param tourId - The ID of the tour.
 * @returns A promise that resolves to the tour.
 */
export async function getTour(tourId: string) {
  const tour = await Tour.findById(tourId)

  return tour
}

/**
 * Service function to create a new tour.
 * @param inputData - The data for the new tour.
 * @returns A promise that resolves to the newly created tour.
 */
export async function createTour(inputData: TCreateTourInput['body']) {
  const newTour = await Tour.create(inputData)

  return newTour
}

/**
 * Service function to update a tour.
 * @param filter - The filter to find the tour to update.
 * @param update - The update data for the tour.
 * @returns A promise that resolves to the updated tour.
 */
export async function updateTour(
  filter: FilterQuery<ITourDocument>,
  update: UpdateQuery<TUpdateTourInput['body']>
) {
  const newTour = await Tour.findOneAndUpdate(filter, update, { new: true })

  return newTour
}

/**
 * Service function to delete a tour.
 * @param tourId - The ID of the tour to delete.
 * @returns A promise that resolves to the deleted tour.
 */
export async function deleteTour(tourId: string) {
  const deletedTour = await Tour.findByIdAndDelete(tourId)

  return deletedTour
}

/**
 * Type representing the statistics of tours.
 */
type TStats = {
  _id: string
  avgRating: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  totalRatingsCount: number
  totalToursCount: number
}[]

/**
 * Service function to get the statistics of tours.
 * @returns A promise that resolves to an array of tour statistics.
 */
export async function getToursStats(): Promise<TStats> {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalRatingsCount: { $sum: '$ratingsCount' },
        totalToursCount: { $sum: 1 }
      }
    },
    {
      $sort: {
        avgPrice: 1 // ASC ORDER
      }
    }
  ])

  return stats
}

/**
 * Type representing the monthly statistics of tours.
 */
type TMonthlyStats = {
  month: number
  toursStartcount: number
  tours: string[]
}[]

/**
 * Service function to get the monthly statistics of tours.
 * @param year - The year for which to get the statistics.
 * @returns A promise that resolves to an array of monthly tour statistics.
 */
export async function getMonthlyStats(year: number): Promise<TMonthlyStats> {
  const stats = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        toursStartcount: { $sum: 1 },
        tours: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { toursStartcount: -1 } // DESC ORDER
    }
  ])
  return stats
}

/**
 * Type representing the properties for getting tours within a certain distance.
 */
type TGetToursWithinProps = {
  distance: string
  latlng: string
  unit: string
  query: ExpressQuery
}

export type TQueryFilterGeoQuery = {
  startLocation?: {
    $geoWithin: {
      $centerSphere: [[number, number], number]
    }
  }
}

/**
 * Service function to get tours within a certain distance from a given location.
 * @param props - The properties for getting tours within a certain distance.
 * @returns A promise that resolves to an array of tours.
 */
export async function getToursWithin({
  distance,
  latlng,
  unit,
  query
}: TGetToursWithinProps) {
  const radius = Number(distance) / EARTH_RADIUS[unit === 'mi' ? 'mi' : 'km']

  const [lat, lng] = latlng.split(',')
  if (!lat || !lng) {
    throw new AppError({
      statusCode: 400,
      message: 'Please provide your position in the format lat,lng'
    })
  }

  const queryFilterGeoQuery: TQueryFilterGeoQuery = {
    startLocation: {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], radius]
      }
    }
  }

  const tours = await queryBuilderService<ITourDocument>({
    queryFilterGeoQuery,
    query,
    Model: Tour
  })

  return tours
}

/**
 * Type representing the properties for getting distances to tours from a point.
 */
type TGetDistancesProps = {
  latlng: string
  unit: string
}

/**
 * Type representing the distances to tours from a point.
 */
type TDistances = { distance: number; name: string }[] | null

/**
 * Service function to get the distances to tours from a given point.
 * @param props - The properties for getting distances to tours.
 * @returns A promise that resolves to an array of distances to tours.
 */
export async function getDistances({
  latlng,
  unit
}: TGetDistancesProps): Promise<TDistances> {
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    throw new AppError({
      statusCode: 400,
      message: 'Please provide your position in the format lat,lng'
    })
  }

  const multiplier = METER_TO[unit === 'mi' ? 'mi' : 'km']

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    },
    {
      $sort: { distance: 1 }
    }
  ])

  return distances
}
