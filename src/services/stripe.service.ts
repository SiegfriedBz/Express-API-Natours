import 'dotenv/config'
import config from 'config'
import Stripe from 'stripe'
const stripe = new Stripe(config.get<string>('stripe.stripePrivateKey'))
import type { Request } from 'express'
import type { IUserDocument } from '../types/user.types'
import type { ITourDocument } from '../types/tour.types'

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
  const userId = user._id.toString()
  const userEmail = user.email

  const tourId = tour._id.toString()
  const {
    price: tourPrice,
    name: tourName,
    slug: tourSlug,
    summary: tourSummary
  } = tour

  const stripeSession = await stripe?.checkout?.sessions?.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/?tourId=${tourId}&userId=${userId}&price=${tourPrice}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tourSlug || 'tour-XXX'}`,
    customer_email: userEmail,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tourName} Tour`,
            description: tourSummary,
            // works only with live hosted imgs
            images: [
              'https://images.unsplash.com/photo-1587775849545-42e56f1849e9?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            ]
          },
          unit_amount: tourPrice * 100 // CENTS
        },
        quantity: 1
      }
    ]
  })

  return stripeSession
}
