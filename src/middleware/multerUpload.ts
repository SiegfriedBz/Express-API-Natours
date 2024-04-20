import multer from 'multer'
import AppError from '../utils/AppError.utils'

/**
 * Defines the storage configuration for multer.
 */
const multerStorage = multer.memoryStorage()

/**
 * Defines the file filter function for multer.
 * @param req - The Express request object.
 * @param file - The uploaded file object.
 * @param cb - The callback function to be called after file filtering.
 */
const multerFileFilter: multer.Options['fileFilter'] = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isValid: boolean = file.mimetype?.startsWith('image')

  if (isValid) {
    cb(null, isValid)
  } else {
    cb(
      new AppError({
        statusCode: 400,
        message: 'Please upload only images'
      })
    )
  }
}

/**
 * Creates a multer instance with the specified file filter and storage configuration.
 */
const upload = multer({
  fileFilter: multerFileFilter,
  storage: multerStorage
})

/**
 * Defines the type for the multer upload properties.
 */
export type TMulterUploadProps = {
  name: string
  maxCount?: number
}[]

/**
 * Creates a middleware function that handles file uploads using multer.
 * @param multerFields - The array of multer upload properties.
 * @returns The multer middleware function.
 */
const multerUpload = (multerFields: TMulterUploadProps) =>
  upload.fields(multerFields)

export default multerUpload
