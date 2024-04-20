/**
 * Middleware function that casts specific fields in the request body to numbers after file upload.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
import { tourMulterNumberFields } from '../utils/multer.upload.tour.utils'
import type { NextFunction, Request, Response } from 'express'

const castToNumberAfterUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const castBody = { ...req.body }

  Object.entries(castBody).forEach(([key, value]) => {
    if (tourMulterNumberFields.includes(key)) {
      castBody[key] = Number(value)
    }
  })

  req.body = castBody

  next()
}

export default castToNumberAfterUpload
