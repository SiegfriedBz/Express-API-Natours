import { Request, Response, NextFunction } from 'express'

const reRoute = async (req: Request, res: Response, next: NextFunction) => {
  req.query = {
    ...req.query,
    limit: '5',
    sort: 'price,-ratingsAverage'
  }
  next()
}

export default reRoute
