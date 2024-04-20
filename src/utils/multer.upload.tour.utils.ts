import type { TMulterUploadProps } from '../middleware/multerUpload'

export const tourMulterNumberFields = [
  'duration',
  'maxGroupSize',
  'price',
  'discount'
]

const tourMulterFields = [
  ...tourMulterNumberFields,
  'imageCover',
  'images',
  'name',
  'difficulty',
  'summary',
  'description',
  'startDates',
  'startLocation',
  'locations',
  'guides'
]

/**
 * Array of fields with their respective configurations for multer.
 */
export const tourMulterUploadFields: TMulterUploadProps =
  tourMulterFields.reduce<{ name: string; maxCount?: number }[]>(
    (acc, fieldName) => {
      return [
        ...acc,
        {
          name: fieldName,
          ...(fieldName === 'imageCover'
            ? { maxCount: 1 }
            : fieldName === 'images'
              ? { maxCount: 3 }
              : {})
        }
      ]
    },
    []
  )
