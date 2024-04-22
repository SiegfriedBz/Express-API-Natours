import mongoose from 'mongoose'
import type { ITourDocument } from './tour.types'
import type { IUserDocument } from './user.types'

export interface IReviewDBInput {
  user: IUserDocument['_id']
  tour: ITourDocument['_id']
  content: string
  rating?: number
}

export interface IReviewDocument extends IReviewDBInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
}
