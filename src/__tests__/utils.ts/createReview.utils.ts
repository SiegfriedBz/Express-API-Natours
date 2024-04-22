import Review from '../../models/review.model'
import { createUserAs } from './createUserAs.utils'
import { createTour } from './createTour.utils'
import { generateReviewInput } from '../fixtures/review/generateReviewInput.fixture'
import type { IReviewDocument } from '../../types/review.types'

type TProps = {
  userId?: string
  tourId?: string
}
export const createReview = async ({
  userId = '',
  tourId = ''
}: TProps = {}) => {
  let review: IReviewDocument | null = null

  if (userId && tourId) {
    review = await Review.create(
      generateReviewInput({
        userId: userId.toString(),
        tourId: tourId.toString()
      })
    )
  } else {
    const user = await createUserAs({ as: 'user' })
    const tour = await createTour()

    review = await Review.create(
      generateReviewInput({ userId: user._id, tourId: tour._id })
    )
  }

  return review.toObject()
}
