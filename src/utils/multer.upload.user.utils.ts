import type { TMulterUploadProps } from '../middleware/multerUpload'

/**
 * Array of fields with their respective configurations for multer.
 */
export const userMulterUploadFields: TMulterUploadProps = [
  { name: 'photo', maxCount: 1 }
]
