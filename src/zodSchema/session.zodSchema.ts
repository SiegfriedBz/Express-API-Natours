import z from 'zod'

const createSessionZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Not a valid email'),
    password: z
      .string({
        required_error: 'Password is required'
      })
      .min(6, 'Password too short - should be 6 chars minimum')
  })
})

type TCreateSessionInput = z.TypeOf<typeof createSessionZodSchema>
export { createSessionZodSchema }
export type { TCreateSessionInput }
