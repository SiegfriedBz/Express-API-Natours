import User from '../../models/user.model'
import { createUserAsInput } from '../fixtures/user/userAsInput.fixture'
import type { IUserDocument } from '../../types/user.types'

type TProps = {
  as: 'user' | 'admin' | 'lead-guide'
}

export const createUserAs = async ({ as }: TProps): Promise<IUserDocument> => {
  const result = await User.create(createUserAsInput({ as }))

  return result.toObject()
}