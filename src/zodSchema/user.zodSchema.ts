import z from 'zod'

export const USER_ROLES = ['admin', 'lead-guide', 'guide', 'user'] as const

const params = {
  userId: z.string()
}

/** USER */
// User - Signup
const createUserZodSchema = z.object({
  body: z
    .object({
      name: z.string({
        required_error: 'Name is required'
      }),
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

// User - Update self (except password)
const updateMeZodSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      photo: z.string().optional()
    })
    .refine((data) => !data?.name || data.name != null, {
      message: 'User name can not be null',
      path: ['name']
    })
    .refine((data) => !data?.email || data.email != null, {
      message: 'User email can not be null',
      path: ['email']
    })
    .refine((data) => !data?.photo || data.photo != null, {
      message: 'User photo can not be null',
      path: ['photo']
    })
})

// User - Update password
const updateMyPasswordZodSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({
          required_error: 'Current password is required'
        })
        .min(6, 'Password too short - should be 6 chars minimum'),
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

// User - Forgot my password
const forgotMyPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required'
      })
      .email('Not a valid email')
  })
})
// User - Reset my password
const resetMyPasswordZodSchema = z.object({
  body: z
    .object({
      password: z
        .string({
          required_error: 'Password is required'
        })
        .min(6, 'Password too short - should be 6 chars minimum'),
      passwordConfirmation: z.string({
        required_error: 'passwordConfirmation is required'
      }),
      resetPasswordToken: z.string({
        required_error: 'resetPasswordToken is required'
      })
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation']
    })
})

/** ADMIN */
// Admin - update user
const adminUpdateUserZodSchema = z.object({
  params: z.object({
    ...params
  }),
  body: z
    .object({
      name: z.string().optional(),
      role: z.enum(USER_ROLES).optional()
    })
    .refine((data) => !data?.name || data.name != null, {
      message: 'User name can not be null',
      path: ['name']
    })
    .refine((data) => !data?.role || USER_ROLES.includes(data.role), {
      message: `User role must be chosen between ${USER_ROLES.join(', ')}`,
      path: ['role']
    })
})

type TCreateUserInput = z.TypeOf<typeof createUserZodSchema>
type TUpdateMeInput = z.TypeOf<typeof updateMeZodSchema>
type TUpdateMyPasswordInput = z.TypeOf<typeof updateMyPasswordZodSchema>
type TForgotMyPasswordInput = z.TypeOf<typeof forgotMyPasswordZodSchema>
type TResetMyPasswordInput = z.TypeOf<typeof resetMyPasswordZodSchema>

type TAdminUpdateUserInput = z.TypeOf<typeof adminUpdateUserZodSchema>

export {
  createUserZodSchema,
  updateMeZodSchema,
  updateMyPasswordZodSchema,
  forgotMyPasswordZodSchema,
  resetMyPasswordZodSchema,
  adminUpdateUserZodSchema
}

export type {
  TCreateUserInput,
  TUpdateMeInput,
  TUpdateMyPasswordInput,
  TForgotMyPasswordInput,
  TResetMyPasswordInput,
  TAdminUpdateUserInput
}
