import Booking from '../../models/booking.model'
import { createUserAs } from './createUserAs.utils'
import { createTour } from './createTour.utils'
import type { IBookingDocument } from '../../types/booking.types'

type TProps = {
  userId?: string
  tourId?: string
  price?: number
}

export const createBooking = async ({
  userId = '',
  tourId = '',
  price = 0
}: TProps = {}) => {
  let booking: IBookingDocument | null = null

  if (userId && tourId && price) {
    booking = await Booking.create({
      user: userId,
      tour: tourId,
      price: price
    })
  } else {
    const user = await createUserAs({ as: 'user' })
    const tour = await createTour()

    booking = await Booking.create({
      user: user._id,
      tour: tour._id,
      price: tour.price
    })
  }

  return booking.toObject()
}
