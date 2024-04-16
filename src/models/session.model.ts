import mongoose from 'mongoose'
import type { ISessionDocument } from '../types/session.types'

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
