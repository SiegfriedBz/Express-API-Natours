import User from '../../models/user.model'
import {
  generateUserAsInput,
  type TRole
} from '../fixtures/user/generateUserAsInput.fixture'
import type { IUserDocument } from '../../types/user.types'

type TProps = TRole

export const createUserAs = async ({ as }: TProps): Promise<IUserDocument> => {
  const result = await User.create(generateUserAsInput({ as }))

  return result.toObject()
}
