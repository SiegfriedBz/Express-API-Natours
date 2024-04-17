import type { TCreateUserInput } from '../../../zodSchema/user.zodSchema'

type TRole = {
  as: 'user' | 'admin' | 'lead-guide'
}

export const CORRECT_PASSWORD = '123456'

/** Generate a valid input to create a 'user' | 'admin' | 'lead-guide'
 *  (using Admin privileges to set the role)
 */
export const createUserAsInput = ({
  as
}: TRole): TCreateUserInput['body'] & {
  role: TRole['as']
} => {
  const id = crypto.randomUUID()

  return {
    name: `I am a ${as}`,
    email: `${as}-${id}@example.com`, // unique
    password: CORRECT_PASSWORD,
    passwordConfirmation: CORRECT_PASSWORD,
    role: as
  }
}
