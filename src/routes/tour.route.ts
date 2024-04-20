import express from 'express'
import reRoute from '../middleware/reRoute'
import requireUser from '../middleware/requireUser'
import restrictTo from '../middleware/restrictTo'
import validateRequest from '../middleware/validateRequest'
import multerUpload from '../middleware/multerUpload'
import castToNumberAfterUpload from '../middleware/castToNumberAfterUpload'
import resizeImages from '../middleware/resizeImages'
import {
  getAllToursHandler,
  createTourHandler,
  getTourHandler,
  updateTourHandler,
  deleteTourHandler,
  getToursStatsHandler,
  getToursMonthlyStatsHandler,
  getToursWithinHandler,
  getDistancesHandler
} from '../controllers/tour.controller'
import {
  createTourZodSchema,
  updateTourZodSchema
} from '../zodSchema/tour.zodSchema'
import { tourMulterUploadFields } from '../utils/multer.upload.tour.utils'

const router = express.Router()

/** re-route */
router.route('/top-5-cheap').get(reRoute, getAllToursHandler) // TODO ADD TESTS

/** Stats */
router.route('/stats').get(getToursStatsHandler)
// Stats - Restricted route
router
  .route('/monthly-stats/:year')
  .get(
    requireUser,
    restrictTo('admin', 'lead-guide', 'guide'),
    getToursMonthlyStatsHandler
  )

/** Geospatial queries */
router
  .route('/within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithinHandler)
router.route('/distances-from/:latlng/unit/:unit').get(getDistancesHandler)

router
  .route('/:tourId')
  /** GET TOUR BY ID */
  .get(getTourHandler)

router
  .route('/')
  /** GET ALL TOURS */
  .get(getAllToursHandler)

/** Admin / Lead-Guide protected routes */
router.use(requireUser, restrictTo('admin', 'lead-guide'))
router
  .route('/')
  /** CREATE TOUR */
  .post(
    multerUpload(tourMulterUploadFields),
    castToNumberAfterUpload,
    validateRequest(createTourZodSchema),
    resizeImages,
    createTourHandler
  )

router
  .route('/:tourId')
  /** UPDATE TOUR */
  .patch(
    multerUpload(tourMulterUploadFields),
    castToNumberAfterUpload,
    validateRequest(updateTourZodSchema),
    resizeImages,
    updateTourHandler
  )

  /** DELETE TOUR */
  .delete(deleteTourHandler)

export default router
