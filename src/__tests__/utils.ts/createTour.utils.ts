import Tour from '../../models/tour.model'
import { generateTourInput } from '../fixtures/tour/generateTourInput.fixture'
import type { ITourDocument } from '../../types/tour.types'

export const createTour = async (): Promise<ITourDocument> => {
  const tour = await Tour.create(generateTourInput())

  return tour.toObject()
}
