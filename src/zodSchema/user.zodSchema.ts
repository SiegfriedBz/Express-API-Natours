import z from 'zod'

const ROLES = ['admin', 'lead-guide', 'guide', 'user'] as const

const bodyBase = {
  name: z.string({
    required_error: 'Name is required'
  })
}

const params = {
  params: z.object({
    userId: z.string()
  })
}

// Create user - Signup
const createUserZodSchema = z.object({
  body: z
    .object({
      ...bodyBase,
      email: z
        .string({
          required_error: 'Email is required'
        })
        .email('Not a valid email'),
      password: z
        .string({
          required_error: 'Password is required'
        })
        .min(6, 'Password too short - should be 6 chars minimum'),
      passwordConfirmation: z.string({
        required_error: 'passwordConfirmation is required'
      })
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation']
    })
})
type TCreateUserInput = z.TypeOf<typeof createUserZodSchema>

// Admin update user
const adminUpdateUserZodSchema = z.object({
  body: z.object({
    ...bodyBase,
    role: z.enum(ROLES, { required_error: 'Role is required' })
  }),
  ...params
})

type TAdminUpdateUserInput = z.TypeOf<typeof adminUpdateUserZodSchema>

export { createUserZodSchema, adminUpdateUserZodSchema }
export type { TCreateUserInput, TAdminUpdateUserInput }
