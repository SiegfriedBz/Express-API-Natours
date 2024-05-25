import mongoose from 'mongoose'
import type { IReviewDocument, IReviewModel } from '../types/review.types'

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

  next()
})

// static method to calculate average rating and number of ratings for a given tour
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].nRating
    })
  } else {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsCount: 1
    })
  }
}

// Step 2: Call this method in a post-save hook
reviewSchema.post<IReviewDocument>('save', function () {
  // this points to current review
  ;(this.constructor as IReviewModel).calcAverageRatings(this.tour)
})

export default mongoose.model<IReviewDocument, IReviewModel>(
  'Review',
  reviewSchema
)
