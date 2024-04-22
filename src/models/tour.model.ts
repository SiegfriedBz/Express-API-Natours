import mongoose from 'mongoose'
import { TOUR_DIFFICULTY } from '../zodSchema/tour.zodSchema'
import type { ITourDocument } from '../types/tour.types'

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Tour name is required'],
      maxlength: [40, 'Tour name too long - should be 40 chars maximum'],
      minlength: [3, 'Tour name too short - should be 3 chars minimum']
    },
    duration: {
      type: Number,
      required: [true, 'Tour duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour maxGroupSize is required']
    },
    difficulty: {
      type: String,
      required: [true, 'Tour difficulty is required'],
      enum: {
        values: TOUR_DIFFICULTY,
        message: `Tour difficulty is required, and must be chosen between ${TOUR_DIFFICULTY.join(', ')}`
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour rating too low - should be 1 minimum'],
      max: [5, 'Tour rating too high - should be 5 maximum'],
      set: (value: number) => Math.round(value * 10) / 10
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Tour price is required']
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val: number) {
          const tourObject = (this as ITourDocument).toObject()
          return val < tourObject.price
        },
        message: 'Tour discount must be less than the price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
      min: [8, 'Tour summary too short - should be 8 chars minimum']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
      // required: [true, "A tour must have a cover image"]
    },
    images: {
      type: [String]
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    //   select: false
    // },
    startDates: {
      type: [Date] // accept timestamps in ms || "2024-03-10" => Mongo will try to parse it into a Date
    },
    slug: String,
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: { type: [Number], default: [115, 8.64] }, // /!\ long, lat
      description: { type: String, default: 'description' }
    },
    locations: [
      // GeoJSON
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: { type: [Number], default: [115, 8.64] }, // /!\ long, lat
        description: { type: String, default: 'description' },
        day: { type: Number, default: 1 }
      }
    ],
    // CHILD Referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
)

tourSchema.index({ startLocation: '2dsphere' })

export default mongoose.model<ITourDocument>('Tour', tourSchema)
