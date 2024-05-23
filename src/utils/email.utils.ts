import 'dotenv/config'
import config from 'config'
import path from 'path'
import nodemailer from 'nodemailer'
import pug from 'pug'
import { convert } from 'html-to-text'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import type { TUserWithoutPassword } from '../services/user.service'
import logger from './logger.utils'

const htmlToTextOptions = {
  wordwrap: 130
}

const isProduction = process.env.NODE_ENV === 'production'

// Brevo
const prodSmtpConfig: SMTPTransport.Options = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.get<string>('email.brevo.emailAdmin'),
    pass: config.get<string>('email.brevo.emailSmtpKey')
  }
}

// Mailtrap
const devSmtpConfig: SMTPTransport.Options = {
  host: config.get<string>('email.mailtrap.emailHost'),
  port: Number(config.get<string>('email.mailtrap.emailPort')),
  auth: {
    user: config.get<string>('email.mailtrap.emailUsername'),
    pass: config.get<string>('email.mailtrap.emailPassword')
  }
}

/**
 * Email utility class for sending emails.
 */
export default class Email {
  from?: string
  to?: string
  firstName?: string
  url?: string

  /**
   * Constructs an Email instance.
   * @param user - The user object.
   * @param url - The URL for the email.
   */
  constructor({ user, url }: { user: TUserWithoutPassword; url: string }) {
    this.from = config.get<string>('email.from')
    this.to = user.email
    this.firstName = user.name.split(' ').at(0)
    this.url = url
  }

  /**
   * Sends a welcome email.
   */
  async sendWelcome() {
    const pugTemplateName = `_welcome`
    const subject = 'Welcome to the Natours Family!'

    await this.#send({ pugTemplateName, subject })
  }

  /**
   * Sends a forgot password email.
   */
  async sendForgotPassword() {
    const pugTemplateName = `_forgotPassword`
    const subject = 'Natours - Your password reset token (valid for 10min)'

    await this.#send({ pugTemplateName, subject })
  }

  /** Private methods */
  /**
   * Sends an email.
   * @param pugTemplateName - The name of the Pug template.
   * @param subject - The subject of the email.
   */
  async #send({
    pugTemplateName,
    subject
  }: {
    pugTemplateName: string
    subject: string
  }) {
    const pugFilePath = path.resolve(
      __dirname,
      `../views/email/${pugTemplateName}.pug`
    )
    logger.info({ pugFilePath })
    // HTML version
    const html = pug.renderFile(pugFilePath, {
      subject,
      firstName: this.firstName,
      url: this.url
    })

    // Text version
    const text = convert(html, htmlToTextOptions)

    // Send email
    const transporter = this.#createNewTransporter()
    await transporter?.sendMail({
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: text // text version of the mail
    })
  }

  /**
   * Creates a new email transporter.
   * @returns The email transporter.
   */
  #createNewTransporter() {
    return nodemailer.createTransport(
      isProduction ? prodSmtpConfig : devSmtpConfig
    )
  }
}
