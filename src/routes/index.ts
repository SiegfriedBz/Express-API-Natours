import deserializeAndRefreshUser from '../middleware/deserializeAndRefreshUser'
import userRoutes from './user.route'
import sessionRoutes from './session.route'
import tourRoutes from './tour.route'
import type { Express, Request, Response } from 'express'

export default function routes(app: Express) {
  app.use(deserializeAndRefreshUser)

  app.get('/api/healthcheck', (req: Request, res: Response) => {
    return res.sendStatus(200)
  })

  app.use('/api/users', userRoutes)
  app.use('/api/sessions', sessionRoutes)
  app.use('/api/tours', tourRoutes)
}
