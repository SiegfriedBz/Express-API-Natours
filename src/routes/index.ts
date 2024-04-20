import logCurrentRoute from '../middleware/logCurrentRoute'
import deserializeAndRefreshUser from '../middleware/deserializeAndRefreshUser'
import userRoutes from './user.route'
import sessionRoutes from './session.route'
import tourRoutes from './tour.route'
import type { Express, Request, Response } from 'express'

export default function routes(app: Express) {
  app.use(logCurrentRoute)

  app.use(deserializeAndRefreshUser)

  app.get('/api/v1/healthcheck', (req: Request, res: Response) => {
    return res.sendStatus(200)
  })

  app.use('/api/v1/users', userRoutes)
  app.use('/api/v1/sessions', sessionRoutes)
  app.use('/api/v1/tours', tourRoutes)
}
