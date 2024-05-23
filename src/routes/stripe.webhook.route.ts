import express, { type Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import { getStripeWebhookEvent } from '../services/stripe.service'
import { createBookingOnTour } from '../services/booking.service'
import { getUser } from '../services/user.service'
import AppError from '../utils/AppError.utils'
import logger from '../utils/logger.utils'

const router = express.Router()

router
  .route('/')
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req
    const stripeSignature = req.headers['stripe-signature'] as string

    let event: Stripe.Event | null = null

    try {
      event = getStripeWebhookEvent(body, stripeSignature)
    } catch (err) {
      const error = err as Error
      return next(
        new AppError({
          statusCode: 400,
          message: `Webhook Error: ${error.message}`
        })
      )
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const checkoutSessionCompleted = event.data.object

      const tourId = checkoutSessionCompleted.client_reference_id
      const tourPrice =
        checkoutSessionCompleted?.amount_total &&
        checkoutSessionCompleted.amount_total / 100

      const userEmail = checkoutSessionCompleted.customer_email as string
      const user = await getUser({ email: userEmail })
      const userId = user?._id

      if (!userId || !tourId || !tourPrice) {
        return next(
          new AppError({
            statusCode: 400,
            message: `Webhook Error: userId, tourId and tourPrice are required to create booking`
          })
        )
      }

      await createBookingOnTour({
        userId,
        tourId,
        tourPrice
      })
    } else {
      logger.info(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({
      status: 'success'
    })
  })

export default router
