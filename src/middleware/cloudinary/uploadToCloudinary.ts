import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse
} from 'cloudinary'
import cldConfig from './config'
import logger from '../../utils/logger.utils'

type TImageBuffer = Express.Multer.File['buffer']
type TProps = {
  folder: 'users' | 'tours'
  imageBuffer: TImageBuffer
  cldPublicId: string
}
const uploadToCloudinary = async ({
  folder,
  imageBuffer,
  cldPublicId
}: TProps) => {
  // Configuration
  cloudinary.config(cldConfig)

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: `natours/${folder}/${cldPublicId}`,
            overwrite: true,
            transformation: [
              folder === 'users'
                ? { width: 500, height: 500, crop: 'limit' }
                : { width: 2000, height: 1333, crop: 'fill' },
              { quality: 'auto' },
              { format: 'webp' }
            ]
          },
          (error, result) => {
            if (error as UploadApiErrorResponse) reject(error)
            else resolve(result as UploadApiResponse)
          }
        )
        .end(imageBuffer)
    })

    logger.info({ cldUploadResult: uploadResult })
    return (uploadResult as UploadApiResponse).secure_url
  } catch (error) {
    logger.info({ cldError: error })
  }
}

export default uploadToCloudinary
