import Booking from '../models/booking.model'
import { queryBuilderService } from '../utils/queryBuilder.service.utils'
import type { Query as ExpressQuery } from 'express-serve-static-core'
import type { IBookingDocument } from '../types/booking.types'
import type { TQueryFilterByTourId } from '../middleware/setQueryFilterByTourId'

/**
 * Retrieves all bookings based on the provided query and filter options.
 * @param {ExpressQuery} props.query - The query object containing request parameters.
 * @param {TQueryFilterByTourId} props.TQueryFilterByTourId - The filter options for finding bookings.
 * @returns {Promise<IBookingDocument[]>} - A promise that resolves to an array of booking documents.
 */
type TProps = {
  queryFilterByTourId: TQueryFilterByTourId
  query: ExpressQuery
}
export async function getAllBookings({
  queryFilterByTourId = {},
  query
}: TProps): Promise<IBookingDocument[]> {
  const bookings = await queryBuilderService<IBookingDocument>({
    queryFilterByTourId,
    query,
    Model: Booking
  })

  return bookings
}

/**
 * Retrieves a booking by its ID.
 * @param {string} bookingId - The ID of the booking.
 * @returns {Promise<IBookingDocument | null>} - A promise that resolves to the booking document, or null if not found.
 */
export async function getBooking(
  bookingId: string
): Promise<IBookingDocument | null> {
  const booking = await Booking.findById(bookingId)

  return booking
}

/**
 * Creates a new booking on a tour.
 * @param {TCreateBookingOnTourProps} props - The properties for creating a booking on a tour.
 * @param {string} props.tourId - The ID of the tour.
 * @param {number} props.tourPrice - The price of the tour.
 * @param {string} props.userId - The ID of the user making the booking.
 * @returns {Promise<IBookingDocument | null>} - A promise that resolves to the created booking document, or null if not created.
 */
type TCreateBookingOnTourProps = {
  tourId: string
  tourPrice: number
  userId: string
}
export async function createBookingOnTour({
  tourId,
  tourPrice,
  userId
}: TCreateBookingOnTourProps): Promise<IBookingDocument | null> {
  const newBooking = await Booking.create({
    price: tourPrice,
    tour: tourId,
    user: userId
  })

  return newBooking
}
