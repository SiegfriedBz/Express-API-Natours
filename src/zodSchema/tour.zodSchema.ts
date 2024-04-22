import z from 'zod'

export const TOUR_DIFFICULTY = ['easy', 'medium', 'difficult'] as const

const params = {
  tourId: z.string()
}

const baseTourBody = {
  /** ONLY OPTIONAL ON TOUR UPDATE */
  name: z
    .string()
    .trim()
    .min(3, 'Tour name too short - should be 3 chars minimum')
    .max(40, 'Tour name too long - should be 40 chars maximum')
    .optional(),
  duration: z
    .number()
    .int()
    .positive('Tour duration must be a number greater than 0')
    .optional(),
  maxGroupSize: z
    .number()
    .int()
    .positive('Tour maxGroupSize must be a number greater than 0')
    .optional(),
  difficulty: z.enum(TOUR_DIFFICULTY).optional(),
  price: z.number().positive().optional(),
  summary: z
    .string()
    .trim()
    .min(8, 'Tour summary too short - should be 8 chars minimum')
    .optional(),
  /** ALWAYS OPTIONAL */
  discount: z.number().optional(),
  description: z.string().trim().optional(),
  imageCover: z.string().optional(),
  images: z.array(z.string()).optional(),
  startDates: z.array(z.string()).optional(),
  startLocation: z
    .object({
      type: z.enum(['Point']).default('Point'),
      coordinates: z.array(z.number()),
      description: z.string()
    })
    .optional(),
  locations: z
    .array(
      z.object({
        type: z.enum(['Point']).default('Point'),
        coordinates: z.array(z.number()),
        description: z.string(),
        day: z.number()
      })
    )
    .optional(),
  guides: z.array(z.string()).optional()
}

const createTourZodSchema = z.object({
  body: z
    .object({ ...baseTourBody })
    .extend({
      name: baseTourBody.name.refine((value) => value != undefined, {
        message: `Tour name is required`
      }),
      duration: baseTourBody.duration.refine((value) => value != undefined, {
        message: `Tour duration is required`
      }),
      maxGroupSize: baseTourBody.maxGroupSize.refine(
        (value) => value != undefined,
        {
          message: `Tour maxGroupSize is required`
        }
      ),
      difficulty: baseTourBody.difficulty.refine(
        (value) => value != undefined && TOUR_DIFFICULTY.includes(value),
        {
          message: `Tour difficulty is required, and must be chosen between ${TOUR_DIFFICULTY.join(', ')}`
        }
      ),
      price: baseTourBody.price.refine((value) => value != undefined, {
        message: `Tour price is required`
      }),
      summary: baseTourBody.summary.refine((value) => value != undefined, {
        message: `Tour summary is required`
      })
    })
    .refine(
      (data) =>
        !data?.discount ||
        (data?.discount && data?.price && data.discount < data.price),
      {
        message: `If a discount is provided, a price must also be provided and the discount must be less than the price`,
        path: ['discount']
      }
    )
})

const updateTourZodSchema = z.object({
  params: z.object({
    ...params
  }),
  body: z
    .object({ ...baseTourBody })
    .extend({
      difficulty: baseTourBody.difficulty.refine(
        (value) => value == undefined || TOUR_DIFFICULTY.includes(value),
        {
          message: `If Tour difficulty is given, it must be chosen between ${TOUR_DIFFICULTY.join(', ')}`
        }
      )
    })
    .refine(
      (data) =>
        !data?.discount ||
        (data?.discount && data?.price && data.discount < data.price),
      {
        message: `If a discount is provided, a price must also be provided and the discount must be less than the price`,
        path: ['discount']
      }
    )
})

type TCreateTourInput = z.TypeOf<typeof createTourZodSchema>
type TUpdateTourInput = z.TypeOf<typeof updateTourZodSchema>
export { createTourZodSchema, updateTourZodSchema }
export type { TCreateTourInput, TUpdateTourInput }
