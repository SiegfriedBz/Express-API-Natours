import mongoose from 'mongoose'
import type { IReviewDocument } from '../types/review.types'

const reviewSchema = new mongoose.Schema(
  {
    content: { type: String, required: [true, 'Review content is required'] },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    // PARENT Referencing
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    // PARENT Referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    }
  },
  { timestamps: true }
)

// prevent 1 user to write 2 reviews for the same tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true })

/** Query pre Hook - this : current Query instance */
reviewSchema.pre(/^find/, function (next) {
  ;(this as mongoose.Query<IReviewDocument[], IReviewDocument>).populate({
    path: 'user',
    select: 'name photo'
  })
  // .populate({
  //   path: 'tour',
  //   select: 'name price'
  // })

  next()
})

export default mongoose.model<IReviewDocument>('Review', reviewSchema)
