import type { TCreateReviewInput } from '../../../zodSchema/review.zodSchema'

type TProps = {
  userId: string
  tourId: string
}

export const generateReviewInput = ({
  userId,
  tourId
}: TProps): TCreateReviewInput['body'] => {
  return {
    content: crypto.randomUUID().toString(),
    rating: 4,
    user: userId,
    tour: tourId
  }
}
