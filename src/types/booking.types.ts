import mongoose from 'mongoose'
import type { ITourDocument } from './tour.types'
import type { IUserDocument } from './user.types'

export interface IBookingDBInput {
  user: IUserDocument['_id']
  tour: ITourDocument['_id']
  price: number
}

export interface IBookingDocument extends IBookingDBInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
}
