import Tour from '../models/tour.model'
import type { TCreateTourInput } from '../zodSchema/tour.zodSchema'

export async function getAllTours() {
  const tours = await Tour.find()

  return tours
}

export async function createTour(inputData: TCreateTourInput['body']) {
  const newTour = await Tour.create(inputData)

  return newTour
}
