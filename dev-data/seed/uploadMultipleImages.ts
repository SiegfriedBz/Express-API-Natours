import path from 'path'
import fs from 'fs/promises'
import uploadToCloudinary from '../../src/middleware/cloudinary/uploadToCloudinary'
import logger from '../../src/utils/logger.utils'
import type { TCreateTourSeed, TCreateUserSeed } from '.'

async function uploadMultipleImages({
  dataForUpload,
  imagesFolderPath,
  modelName
}: {
  dataForUpload: TCreateUserSeed[] | TCreateTourSeed[]
  imagesFolderPath: string
  modelName: string
}) {
  try {
    const updatedData = await Promise.all(
      dataForUpload.map(async (item) => {
        if (modelName === 'tours') {
          const tour = item as TCreateTourSeed
          if (tour?.imageCover && tour?.images && tour?.images?.length > 0) {
            const coverImagePath = path.join(imagesFolderPath, tour.imageCover)
            const coverImageBuffer = await fs.readFile(coverImagePath)
            const coverImageSecureUrl = await uploadToCloudinary({
              folder: 'tours',
              imageBuffer: coverImageBuffer,
              cldPublicId: `tour-${tour._id}-cover`
            })

            const imagesSecureUrls = await Promise.all(
              tour.images.map(async (image, index) => {
                const imagePath = path.join(imagesFolderPath, image)
                const imageBuffer = await fs.readFile(imagePath)
                const secureUrl = await uploadToCloudinary({
                  folder: 'tours',
                  imageBuffer,
                  cldPublicId: `tour-${tour._id}-image-${index + 1}`
                })
                return secureUrl
              })
            )

            return {
              ...tour,
              imageCover: coverImageSecureUrl,
              images: imagesSecureUrls
            }
          } else return tour
        } else {
          const user = item as TCreateUserSeed
          const imagePath = path.join(imagesFolderPath, user.photo)
          const imageBuffer = await fs.readFile(imagePath)
          const secureUrl = await uploadToCloudinary({
            folder: 'users',
            imageBuffer,
            cldPublicId: `user-${user._id}`
          })
          return { ...user, photo: secureUrl }
        }
      })
    )
    return updatedData
  } catch (error) {
    logger.info({ message: 'Uploading images went wrong' })
  }
}

export default uploadMultipleImages
