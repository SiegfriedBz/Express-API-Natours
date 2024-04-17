import mongoose from 'mongoose'
import { IUserDocument } from './user.types'

export interface ISessionDBInput {
  user: IUserDocument['_id']
  isValid: boolean
}

export interface ISessionDocument extends ISessionDBInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
}
