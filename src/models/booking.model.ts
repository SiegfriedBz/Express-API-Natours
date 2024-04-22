import mongoose from 'mongoose'
import type { IBookingDocument } from '../types/booking.types'

const bookingSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: [true, 'Booking price is required']
    },
    // Parent Referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour']
    },
    // Parent Referencing
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user']
    }
  },
  { timestamps: true }
)

export default mongoose.model<IBookingDocument>('Booking', bookingSchema)
