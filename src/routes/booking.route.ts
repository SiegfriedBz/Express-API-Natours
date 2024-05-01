import express from 'express'
import setQueryFilterByTourId from '../middleware/setQueryFilterByTourId'
import {
  getAllBookingsHandler,
  getBookingHandler,
  getStripeCheckoutSessionHandler
} from '../controllers/booking.controller'
import restrictToRole from '../middleware/restrictToRole'
import requireUser from '../middleware/requireUser'

/** Preserve the req.params values from the parent router.*/
const router = express.Router({ mergeParams: true })

/** Protected */
router.use(requireUser)

/** Handle
 * GET /api/v1/bookings/checkout-session/:tourId
 */
router.get('/checkout-session/:tourId', getStripeCheckoutSessionHandler)

router
  .route('/')
  /** Handle
   * GET /api/v1/bookings
   * GET /api/v1/tours/:id/bookings
   */
  .get(restrictToRole('admin'), setQueryFilterByTourId, getAllBookingsHandler)

/** Handle
 * GET /api/v1/bookings/:bookingId
 */
router.get('/:bookingId', getBookingHandler)

export default router
