import express from 'express'
import logCurrentRoute from '../middleware/logCurrentRoute'
import deserializeAndRefreshUser from '../middleware/deserializeAndRefreshUser'
import stripeWebhookRoute from './stripe.webhook.route'
import userRoutes from './user.route'
import sessionRoutes from './session.route'
import tourRoutes from './tour.route'
import reviewRoutes from './review.route'
import bookingRoutes from './booking.route'
import AppError from '../utils/AppError.utils'
import type { Express, NextFunction, Request, Response } from 'express'

export default function routes(app: Express) {
  app.use(logCurrentRoute)

  // stripe webhook
  app.use(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhookRoute
  )

  // parse json only if not stripe webhook
  app.use(express.json())

  app.use(deserializeAndRefreshUser)

  app.get('/api/v1/healthcheck', (req: Request, res: Response) => {
    return res.sendStatus(200)
  })

  app.use('/api/v1/users', userRoutes)
  app.use('/api/v1/sessions', sessionRoutes)
  app.use('/api/v1/tours', tourRoutes)
  app.use('/api/v1/reviews', reviewRoutes)
  app.use('/api/v1/bookings', bookingRoutes)

  // All catch route
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(
      new AppError({
        statusCode: 404,
        message: `No route match ${req.originalUrl} on this server`
      })
    )
  })
}
