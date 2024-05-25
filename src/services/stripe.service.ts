import 'dotenv/config'
import config from 'config'
import Stripe from 'stripe'
import type { Request } from 'express'
import type { IUserDocument } from '../types/user.types'
import type { ITourDocument } from '../types/tour.types'
import logger from '../utils/logger.utils'

const stripe = new Stripe(config.get<string>('stripe.stripePrivateKey'))
const stripeWebhookEndpointSecret = config.get<string>(
  'stripe.stripeWebhookEndpointSecret'
)

type TProps = {
  req: Request
  user: IUserDocument
  tour: ITourDocument
}

/**
 * Create Stripe Checkout Session
 * @param {Object} props - The properties for creating the Stripe Checkout Session.
 * @param {Request} props.req - The Express request object.
 * @param {IUserDocument} props.user - The user document.
 * @param {ITourDocument} props.tour - The tour document.
 * @returns {Promise<Object>} - The created Stripe Checkout Session.
 */

export const getStripeCheckoutSession = async ({ req, user, tour }: TProps) => {
  const userEmail = user.email

  const tourId = tour._id.toString()
  const {
    price: tourPrice,
    name: tourName,
    // slug: tourSlug,
    summary: tourSummary,
    imageCover: tourImageCover
  } = tour

  const refererUrl =
    req.get('referer') || config.get<string>('cors.allowedOrigins')
  const origin = new URL(refererUrl as string).origin

  const stripeSession = await stripe?.checkout?.sessions?.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // success_url: `${origin}/bookings?tourId=${tourId}&userId=${userId}&price=${tourPrice}`,
    success_url: `${origin}/my-bookings`,
    // cancel_url: `${origin}/tours/${tourSlug}`,
    cancel_url: `${origin}/tours/${tourId}`,
    customer_email: userEmail,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tourName} Tour`,
            description: tourSummary,
            // works only with live hosted imgs - get from cloudinary
            images: [tourImageCover]
          },
          unit_amount: tourPrice * 100 // CENTS
        },
        quantity: 1
      }
    ]
  })

  return stripeSession
}

/**
 * Retrieves the Stripe webhook event from the provided request body and signature.
 * @param body - The request body containing the event data.
 * @param stripeSignature - The signature of the webhook event.
 * @returns The retrieved Stripe webhook event.
 */
export const getStripeWebhookEvent = (
  body: string | Buffer,
  stripeSignature: string
) => {
  logger.info({ stripeWebhookBody: body })
  logger.info({ getStripeWebhookSig: stripeSignature })
  logger.info({ getStripeWebhookSecret: stripeWebhookEndpointSecret })

  const event = stripe.webhooks.constructEvent(
    body,
    stripeSignature,
    stripeWebhookEndpointSecret
  )
  logger.info({ getStripeWebhookEvent: event })

  return event
}
