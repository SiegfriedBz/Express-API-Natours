import mongoose from 'mongoose'
import type { IUserDocument } from './user.model'

export interface ISessionInput {
  user: IUserDocument['_id']
  isValid: boolean
}

export interface ISessionDocument extends ISessionInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
}

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<ISessionDocument>('Session', sessionSchema)
