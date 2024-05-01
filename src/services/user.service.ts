import crypto from 'crypto'
import { omit } from 'lodash'
import User from '../models/user.model'
import AppError from '../utils/AppError.utils'
import type { FilterQuery, UpdateQuery } from 'mongoose'
import type {
  TAdminUpdateUserInput,
  TCreateUserInput,
  TUpdateMeInput
} from '../zodSchema/user.zodSchema'
import type { IUserDocument } from '../types/user.types'
import logger from '../utils/logger.utils'

export type TUserWithoutPassword = Omit<IUserDocument, 'password'>

/**
 * Sets the password reset token for a user.
 * @param email - The email of the user.
 * @returns An object containing the user without the password field and the reset token.
 * @throws {AppError} If there is no user with the provided email address.
 */
export async function setPasswordResetToken(
  email: string
): Promise<{ userWithoutPassword: TUserWithoutPassword; resetToken: string }> {
  try {
    /** 1. Get user */
    const user = await User.findOne({ email })

    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: 'There is no user with this email address'
      })
    }

    /** 2. Create Password Reset Token + expiry date */
    const resetToken = user.createPasswordResetToken()

    /** 3. Save resetToken Hash w/OUT running validators (pswd...not provided) */
    await user.save({ validateBeforeSave: false })

    /** 4. Set user without password to return */
    const userWithoutPassword = omit(
      user.toObject(),
      'password'
    ) as unknown as Omit<IUserDocument, 'password'>

    // return user & new password resetToken (not-hash)
    return { userWithoutPassword, resetToken }
  } catch (error) {
    logger.info(error)
    throw error
  }
}

type TValidatePasswordResetTokenProps = {
  password: string
  submittedResetPasswordToken: string
}
/**
 * Validates the password reset token and updates the user's password.
 * @param password - The new password.
 * @param submittedResetPasswordToken - The submitted reset password token.
 * @returns The updated user without the password field.
 * @throws {AppError} If the reset token is invalid or has expired.
 */
export async function validatePasswordResetToken({
  password,
  submittedResetPasswordToken
}: TValidatePasswordResetTokenProps): Promise<TUserWithoutPassword> {
  try {
    /** 1. Hash submittedToken */
    const submittedTokenHash = crypto
      .createHash('sha256')
      .update(submittedResetPasswordToken)
      .digest('hex')

    /** 2. Check if valid submittedToken */
    const user = await User.findOne({
      passwordResetToken: submittedTokenHash,
      passwordResetTokenExpiresAt: {
        $gt: Date.now()
      }
    })

    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: 'Your reset token is invalid or has expired'
      })
    }

    /** 3. Update user password & Re-init resetPassword token */
    user.password = password
    user.passwordResetToken = ''
    user.passwordResetTokenExpiresAt = new Date(0)
    await user.save()

    /** 4. Set user without password to return */
    const userWithoutPassword = omit(
      user.toObject(),
      'password'
    ) as unknown as Omit<IUserDocument, 'password'>

    return userWithoutPassword
  } catch (error) {
    logger.info(error)
    throw error
  }
}

/**
 * Creates a new user.
 * @param inputData - The user data.
 * @returns The created user without the password field.
 * @throws {AppError} If there is an error creating the user.
 */
export async function createUser(
  inputData: TCreateUserInput['body']
): Promise<TUserWithoutPassword | null> {
  try {
    const newUser = await User.create(inputData)

    return newUser
      ? (omit(newUser.toObject(), 'password') as unknown as Omit<
          IUserDocument,
          'password'
        >)
      : null
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new AppError({ statusCode: 409, message: err.message })
    } else {
      throw err
    }
  }
}

/**
 * Updates a user.
 * @param filter - The filter to find the user.
 * @param update - The data to update the user.
 * @returns The updated user without the password field.
 */
export async function updateUser(
  filter: FilterQuery<IUserDocument>,
  update: UpdateQuery<TAdminUpdateUserInput['body'] | TUpdateMeInput['body']>
): Promise<TUserWithoutPassword | null> {
  const updatedUser = await User.findOneAndUpdate(filter, update, {
    new: true
  }).select('-password')

  return updatedUser
}

/**
 * Retrieves all users.
 * @returns An array of users without the password field.
 */
export async function getAllUsers(): Promise<TUserWithoutPassword[] | null> {
  const users = await User.find().select('-password')

  return users
}

/**
 * Retrieves a user by ID.
 * @param userId - The ID of the user.
 * @returns The user without the password field.
 */
type TGetUserProps = {
  userId?: string
  userEmail?: string
}
export async function getUser({
  userId,
  userEmail
}: TGetUserProps): Promise<TUserWithoutPassword | null> {
  const query = userEmail
    ? User.findOne({ email: userEmail })
    : User.findById(userId)

  const user = await query.select('-password')

  return user
}

/** Helpers */

/**
 * Checks the email and password of a user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @returns The user document if the email and password are valid, otherwise null.
 */
type TPropsCheckPassword = {
  email: string
  password: string
}
export async function checkPassword({
  email,
  password
}: TPropsCheckPassword): Promise<IUserDocument | null> {
  const user = await User.findOne({ email })

  if (!user) {
    return null
  }

  const isValid = await (user as IUserDocument).comparePassword(password)
  if (!isValid) {
    return null
  }

  return user
}
