import Email from '../utils/email.utils'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'
import type { TUserWithoutPassword } from './user.service'

export type TSendEmailProps = {
  user: TUserWithoutPassword
  url: string
}

/**
 * Sends a welcome email to the user.
 * @param {TSendEmailProps} props - The email properties.
 * @returns {Promise<boolean>} - A promise that resolves to true if the email is sent successfully.
 * @throws {AppError} - If an error occurs while sending the email.
 */
export async function sendWelcomeEmail({ user, url }: TSendEmailProps) {
  try {
    await new Email({ user, url }).sendWelcome()
    return true
  } catch (error) {
    logger.info(error)
    throw new AppError({
      statusCode: 500,
      message: `Something went wrong while sending Welcome Email, please try again later`
    })
  }
}

/**
 * Sends a 'Forgot my password' email to the user.
 * @param {TSendEmailProps} props - The email properties.
 * @returns {Promise<boolean>} - A promise that resolves to true if the email is sent successfully.
 * @throws {AppError} - If an error occurs while sending the email.
 */
export async function sendForgotMyPasswordEmail({
  user,
  url
}: TSendEmailProps) {
  try {
    // send email => link to get reset password FORM
    await new Email({ user, url }).sendForgotPassword()
    return true
  } catch (error) {
    logger.info(error)
    throw new AppError({
      statusCode: 500,
      message: `Something went wrong while sending 'Forgot my password' Email, please try again later`
    })
  }
}
