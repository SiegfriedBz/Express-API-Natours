import { FilterQuery } from 'mongoose'
import Booking from '../models/booking.model'
import { queryBuilderService } from '../utils/queryBuilder.service.utils'
import type { Query as ExpressQuery } from 'express-serve-static-core'
import type { IBookingDocument } from '../types/booking.types'
import type { TQueryFilterByTourId } from '../middleware/setQueryFilterByTourId'
import logger from '../utils/logger.utils'

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
 * Retrieves a booking document based on the provided filter.
 *
 * @param filter - The filter query to find the booking document.
 * @returns A promise that resolves to the found booking document, or null if not found.
 */
export async function getBooking(
  filter: FilterQuery<IBookingDocument>
): Promise<IBookingDocument | null> {
  const booking = await Booking.findOne(filter)

  return booking
}

/**
 * Creates a new booking on a tour.
 * Initiated in stripe checkout webhook
 * @param {TCreateBookingOnTourProps} props - The properties for creating a booking on a tour.
 * @param {string} props.userId - The ID of the user making the booking.
 * @param {string} props.tourId - The ID of the tour.
 * @param {number} props.tourPrice - The price of the tour.
 * @returns {Promise<IBookingDocument | null>} - A promise that resolves to the created booking document, or null if not created.
 */
export type TCreateBookingOnTourProps = {
  userId: string
  tourId: string
  tourPrice: number
}
export async function createBookingOnTour({
  userId,
  tourId,
  tourPrice
}: TCreateBookingOnTourProps): Promise<IBookingDocument | null> {
  const newBooking = await Booking.create({
    user: userId,
    price: tourPrice,
    tour: tourId
  })

  logger.info({ createBookingOnTour: newBooking })

  return newBooking
}

/**
 * Retrieves bookings for a specific user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of booking documents.
 */
export async function getMyBookings(
  userId: string
): Promise<IBookingDocument[]> {
  const bookings = await Booking.find({ user: userId })

  return bookings
}
