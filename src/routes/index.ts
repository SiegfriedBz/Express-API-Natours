import userRoutes from './user.route'
import sessionRoutes from './session.route'
import type { Express, Request, Response } from 'express'

export default function routes(app: Express) {
  app.get('/api/healthcheck', (req: Request, res: Response) => {
    return res.sendStatus(200)
  })

  app.use('/api/users', userRoutes)
  app.use('/api/sessions', sessionRoutes)
}
