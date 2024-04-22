import z from 'zod'

/** create review on tour with id */
const createReviewParams = {
  id: z.string() // tour id
}

/** update review with reviewId */
const updateReviewParams = {
  reviewId: z.string()
}

const createReviewZodSchema = z.object({
  params: z.object(createReviewParams),
  body: z.object({
    content: z.string({ required_error: 'Review content is required' }),
    rating: z
      .number({ required_error: 'Review rating is required' })
      .min(1, 'Review rating must be between 1 and 5')
      .max(5, 'Review rating must be between 1 and 5'),
    user: z.string({ required_error: 'Review must belong to a user' }),
    tour: z.string({ required_error: 'Review must belong to a tour' })
  })
})

const updateReviewZodSchema = z.object({
  params: z.object(updateReviewParams),
  body: z
    .object({
      content: z.string().optional(),
      rating: z.number().optional()
    })
    .refine((data) => {
      return (
        data?.content && data.content != undefined,
        {
          message: 'Review content can not be empty'
        }
      )
    })
    .refine((data) => {
      return (
        data?.rating && data.rating >= 1 && data.rating <= 5,
        {
          message: 'Review rating must be between 1 and 5'
        }
      )
    })
})

type TCreateReviewInput = z.TypeOf<typeof createReviewZodSchema>
type TUpdateReviewInput = z.TypeOf<typeof updateReviewZodSchema>

export { createReviewZodSchema, updateReviewZodSchema }
export type { TCreateReviewInput, TUpdateReviewInput }
