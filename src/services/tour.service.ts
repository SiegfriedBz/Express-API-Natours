import Tour from '../models/tour.model'
import type { TCreateTourInput } from '../zodSchema/tour.zodSchema'

export async function createTour(inputData: TCreateTourInput['body']) {
  const newTour = await Tour.create(inputData)

  return newTour
}
