import path from 'path'
import sharp from 'sharp'
import logger from '../utils/logger.utils'
import AppError from '../utils/AppError.utils'
import type { Request, Response, NextFunction } from 'express'
import type { TCreateTourInput } from '../zodSchema/tour.zodSchema'

/**
 * Middleware function to resize multer uploaded tour images.
 *
 * This function expects the request (`req`) to contain:
 * - `tourId` (optional: absent on createTour, present on updateTour): The ID of the tour, used to name the output files.
 * - `userId` (optional: present on updateMe): The ID of the user, used to name the output files.
 * - `files`: An object or array of `Express.Multer.File` instances, representing the uploaded files.
 *
 * The function performs the following steps:
 * - If no files were uploaded, it immediately calls the next middleware.
 * - Otherwise, it processes each uploaded file:
 *   - Resizes the image to 2000x1333 pixels.
 *   - Converts the image to the WebP format with a quality of 90.
 *   - Saves the processed image to the `public/img/tours` directory.
 * - The names of the processed files are stored in `res.locals.allTourImageFileNames` for use in subsequent middleware.
 *
 * If an error occurs during processing, it is logged and passed to the error middleware.
 *
 * @param req The incoming request, expected to contain the uploaded files.
 * @param res The outgoing response, used to store the names of the processed files.
 * @param next The next middleware function to call.
 */

export interface IRequestBodyImages {
  body: {
    files:
      | Express.Multer.File[]
      | {
          [fieldname: string]: Express.Multer.File[]
        }
      | undefined
  }
}

const resizeImages = async (
  req: Request<
    {
      tourId?: string
    },
    object,
    TCreateTourInput['body'] & IRequestBodyImages
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    /** userId */
    const userId = res.locals.user._id

    /**
     * tourId
     *  != null on updateTour route
     */
    const tourId = req.params?.tourId

    /**
     * files
     *  - user files
     *  req.files.photo
     *
     *  - tour files
     *  req.files.imageCover
     *  req.files.images
     */
    const imageFiles = req.files as {
      [fieldname: string]: Express.Multer.File[]
    }

    // if no image upload
    if (!imageFiles) {
      return next()
    }

    /** Handle
     * - User images - updateMe route
     * - Tour images - createTour & updateTour routes
     * */
    // Attach all images on RES.LOCALS object to be used in next middleware
    const userImageFileName = { photo: '' } as {
      photo: string
    }
    const allTourImageFileNames = { imageCover: '', images: [] } as {
      imageCover: string
      images: string[]
    }

    res.locals.userImageFileName = userImageFileName
    res.locals.allTourImageFileNames = allTourImageFileNames

    /** Get images from memory after multer.memoryStorage() */
    const userImageBuffer = imageFiles?.['photo']
    const tourImageCoverBuffer = imageFiles?.['imageCover']
    const tourImagesBuffer = imageFiles?.['images']

    const uniqueId = crypto.randomUUID()

    // 1. Treat User - Photo img
    if (userId && userImageBuffer?.[0]?.buffer != null) {
      // Generate unique image name
      const userFileName = `user-${userId}-${uniqueId}-photo.webp`
      // add file name to RES.LOCALS.allTourImageFileNames
      userImageFileName.photo = userFileName

      // treat image
      await sharp(userImageBuffer[0].buffer)
        .resize(2000, 1333)
        .toFormat('webp')
        .webp({ quality: 90 })
        .toFile(
          path.resolve(__dirname, `../../public/img/users/${userFileName}`)
        )
    }

    // 2. Treat Tour - Cover img
    if (tourImageCoverBuffer?.[0]?.buffer != null) {
      // Generate unique image name
      const imageCoverName = `tour-${tourId ? tourId : ''}-${uniqueId}-cover.webp`
      // add file name to RES.LOCALS.allTourImageFileNames
      allTourImageFileNames.imageCover = imageCoverName

      // treat image
      await sharp(tourImageCoverBuffer[0].buffer)
        .resize(2000, 1333)
        .toFormat('webp')
        .webp({ quality: 90 })
        .toFile(
          path.resolve(__dirname, `../../public/img/tours/${imageCoverName}`)
        )
    }

    // 3. Treat Tour - rest of images
    if (tourImagesBuffer?.length > 0) {
      await Promise.all(
        // return an array of promises
        tourImagesBuffer.map((imgBuffer, idx) => {
          // Generate unique image name
          const imageName = `tour-${tourId ? tourId : ''}-${uniqueId}-${idx + 1}.webp`
          // add file name to RES.LOCALS.allTourImageFileNames
          allTourImageFileNames.images = [
            ...allTourImageFileNames.images,
            imageName
          ]

          // treat image
          return sharp(imgBuffer.buffer)
            .resize(2000, 1333)
            .toFormat('webp')
            .webp({ quality: 90 })
            .toFile(
              path.resolve(__dirname, `../../public/img/tours/${imageName}`)
            )
        })
      )
    }

    next()
  } catch (error: unknown) {
    logger.error(error)
    if (error instanceof Error) {
      return next(new AppError({ statusCode: 500, message: error.message }))
    }
    next(error)
  }
}

export default resizeImages
