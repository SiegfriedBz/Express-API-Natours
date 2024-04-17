import z from 'zod'

const createTourZodSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Tour name is required' })
        .trim()
        .min(3, 'Tour name too short - should be 3 chars minimum')
        .max(40, 'Tour name too long - should be 40 chars maximum'),
      duration: z
        .number({ required_error: 'Tour duration is required' })
        .int()
        .positive(),
      maxGroupSize: z
        .number({ required_error: 'Tour maxGroupSize is required' })
        .int()
        .positive(),
      difficulty: z
        .enum(['easy', 'medium', 'difficult'])
        .refine(
          (value) =>
            value != undefined &&
            ['easy', 'medium', 'difficult'].includes(value),
          {
            message:
              'Tour difficulty is required, and must be "easy", "medium", or "difficult"'
          }
        ),
      price: z.number({ required_error: 'Tour price is required' }).positive(),
      discount: z.number().optional(),
      summary: z
        .string({ required_error: 'A tour must have a summary' })
        .trim()
        .min(8, 'Tour summary too short - should be 8 chars minimum'),
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
    })
    .refine((data) => data?.discount && data.discount < data.price, {
      message: `Discount must be less than price`,
      path: ['discount']
    })
})

type TCreateTourInput = z.TypeOf<typeof createTourZodSchema>

export { createTourZodSchema }
export type { TCreateTourInput }
