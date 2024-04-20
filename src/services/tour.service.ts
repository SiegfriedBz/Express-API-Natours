import Tour from '../models/tour.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import type {
  TCreateTourInput,
  TUpdateTourInput
} from '../zodSchema/tour.zodSchema'
import type { ITourDocument } from '../types/tour.types'

const EARTH_RADIUS = {
  mi: 3963.2,
  km: 6378.1
}
const METER_TO = {
  mi: 0.000621371,
  km: 0.001
}

export async function getAllTours() {
  const tours = await Tour.find()

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
export async function getToursStats() {
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
        // using the keys returned by previous stage
        avgPrice: 1 // ASC ORDER
      }
    }
  ])

  return stats
}

export async function getMonthlyStats(year: number) {
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
export async function getToursWithin({
  distance,
  latlng,
  unit
}: {
  distance: string
  latlng: string
  unit: string
}) {
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
        $centerSphere: [[lng, lat], radius]
      }
    }
  })

  return tours
}

export async function getDistances({
  latlng,
  unit
}: {
  latlng: string
  unit: string
}) {
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
