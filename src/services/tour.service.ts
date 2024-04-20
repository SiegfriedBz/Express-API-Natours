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

export async function getAllTours(query: ExpressQuery) {
  const tours = await queryBuilderService<ITourDocument>({ query, Model: Tour })

  return tours
}

export async function getTour(tourId: string) {
  const tour = await Tour.findById(tourId)

  return tour
}

export async function createTour(inputData: TCreateTourInput['body']) {
  const newTour = await Tour.create(inputData)

  return newTour
}

export async function updateTour(
  filter: FilterQuery<ITourDocument>,
  update: UpdateQuery<TUpdateTourInput['body']>
) {
  const newTour = await Tour.findOneAndUpdate(filter, update, { new: true })

  return newTour
}

export async function deleteTour(tourId: string) {
  const deletedTour = await Tour.findByIdAndDelete(tourId)

  return deletedTour
}

/** Stats */
// Tours' stats
type TStats = {
  _id: string
  avgRating: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  totalRatingsCount: number
  totalToursCount: number
}[]

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

// Tours' monthly stats
type TMonthlyStats = {
  month: number
  toursStartcount: number
  tours: string[]
}[]

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
        _id: { $month: '$startDates' }, // extract the month of this date and set this month as a key for this group
        toursStartcount: { $sum: 1 },
        tours: {
          // create an array and push each Tour.name
          $push: '$name'
        }
      }
    },
    {
      // add a key
      $addFields: {
        month: '$_id' // add a month key wich value is id from previous stage
      }
    },

    {
      // remove a key
      $project: {
        _id: 0 // remove the key _id
      }
    },

    {
      $sort: { toursStartcount: -1 } // DESC ORDER
    }
  ])
  return stats
}

/** Geo */
type TGetToursWithinProps = {
  distance: string
  latlng: string
  unit: string
}

export async function getToursWithin({
  distance,
  latlng,
  unit
}: TGetToursWithinProps) {
  // radiant
  const radius = Number(distance) / EARTH_RADIUS[unit === 'mi' ? 'mi' : 'km']

  const [lat, lng] = latlng.split(',')
  if (!lat || !lng) {
    throw new AppError({
      statusCode: 400,
      message: 'Please provide your position in the format lat,lng'
    })
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], radius]
      }
    }
  })

  return tours
}

// Get Distances to tours from a point
type TGetDistancesProps = {
  latlng: string
  unit: string
}
type TDistances = { distance: number; name: string }[] | null

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
      // $geoNear MUST be 1st stage in pipeline
      // $geoNear need tourSchema.index({ startLocation: "2dsphere" })
      //  => will use startLocation as starting point for distances
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
