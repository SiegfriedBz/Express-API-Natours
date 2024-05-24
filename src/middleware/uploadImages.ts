import logger from '../utils/logger.utils'
import AppError from '../utils/AppError.utils'
import uploadToCloudinary from './cloudinary/uploadToCloudinary'
import type { Request, Response, NextFunction } from 'express'
import type { TCreateTourInput } from '../zodSchema/tour.zodSchema'

/**
 * Middleware function to process multer uploaded tour images and upload them to Cloudinary.
 *
 * This function expects the request (`req`) to contain:
 * - `tourId` (optional: absent on createTour, present on updateTour): The ID of the tour, used to name the output files.
 * - `userId` (optional: present on updateMe): The ID of the user, used to name the output files.
 * - `files`: An object or array of `Express.Multer.File` instances, representing the uploaded files.
 *
 * The function performs the following steps:
 * - If no files were uploaded, it immediately calls the next middleware.
 * - Otherwise, it processes each uploaded file:
 *   - Uploads the image to Cloudinary.
 *   - Cloudinary processes the image and returns a secure URL.
 * - The secure URLs of the processed images are stored in `res.locals.allTourImageFileNames` for use in subsequent middleware.
 *
 * Note: This function does not save any files to the local file system. All images are directly uploaded to Cloudinary.
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

const uploadImages = async (
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

    // 1. USER - Photo img
    if (userId && userImageBuffer?.[0]?.buffer != null) {
      // Generate unique image name
      const userFileName = `user-${userId}`

      try {
        // 1. Cloudinary upload => get cloudinary image secure_url
        const cldImageUrl = await uploadToCloudinary({
          folder: 'users',
          imageBuffer: userImageBuffer[0].buffer,
          cldPublicId: userFileName
        })
        if (!cldImageUrl) throw new Error('Cloudinary image upload failed')
        logger.info({ cldImageUrl })

        // 2. Add the cld secure_url to RES.LOCALS.allTourImageFileNames
        userImageFileName.photo = cldImageUrl
      } catch (error) {
        logger.info(error)
        return next(
          new AppError({
            statusCode: 500,
            message: 'Cloudinary image upload failed'
          })
        )
      }
    }

    // 2. TOURS - Treat Tour - Cover img
    if (tourImageCoverBuffer?.[0]?.buffer != null) {
      // Generate unique image name
      const imageCoverName = `tour-${tourId ? tourId : uniqueId}-cover`

      try {
        // 1. Cloudinary upload => get cloudinary image secure_url
        const cldImageUrl = await uploadToCloudinary({
          folder: 'tours',
          imageBuffer: tourImageCoverBuffer[0].buffer,
          cldPublicId: imageCoverName
        })
        if (!cldImageUrl) throw new Error('Cloudinary image upload failed')

        // 2. Add the cld secure_url to RES.LOCALS.allTourImageFileNames
        allTourImageFileNames.imageCover = cldImageUrl
      } catch (error) {
        logger.info(error)
        return next(
          new AppError({
            statusCode: 500,
            message: 'Cloudinary image upload failed'
          })
        )
      }
    }

    // 3. TOURS - Treat Tour - rest of images
    if (tourImagesBuffer?.length > 0) {
      try {
        let allCldImageUrls = await Promise.all(
          // return an array of promises
          tourImagesBuffer.map((imgBuffer, idx) => {
            // Generate unique image name
            const imageName = `tour-${tourId ? tourId : uniqueId}-image-${idx + 1}`

            // 1. Concurrently Cloudinary upload => get cloudinary image secure_url promise
            const cldImageUrlPromise = uploadToCloudinary({
              folder: 'tours',
              imageBuffer: imgBuffer.buffer,
              cldPublicId: imageName
            })
            return cldImageUrlPromise
          })
        )

        allCldImageUrls = allCldImageUrls.filter(
          (url): url is string | undefined => url !== undefined
        )

        if (allCldImageUrls?.length === 0) {
          return next(
            new AppError({
              statusCode: 500,
              message: 'Cloudinary images upload failed'
            })
          )
        }

        // 2. Add the cld secure_url to RES.LOCALS.allTourImageFileNames
        allTourImageFileNames.images = allCldImageUrls as string[]
      } catch (error) {
        logger.info(error)
        return next(
          new AppError({
            statusCode: 500,
            message: 'Cloudinary images upload failed'
          })
        )
      }
    }

    next()
  } catch (error: unknown) {
    logger.info(error)
    if (error instanceof Error) {
      return next(new AppError({ statusCode: 500, message: error.message }))
    }
    next(error)
  }
}

export default uploadImages
