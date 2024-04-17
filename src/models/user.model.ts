import config from 'config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { IUserDocument } from '../types/user.types'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    role: {
      type: String,
      enum: {
        values: ['admin', 'lead-guide', 'guide', 'user'],
        message: "A role must be 'admin', 'lead-guide', 'guide' or 'user'"
      },
      default: 'user'
    }
  },
  { timestamps: true }
)

// pre-hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(config.get<number>('bcrypt.saltWorkFactor'))
  const hashPassword: string = await bcrypt.hash(this.password, salt)

  this.password = hashPassword

  next()
})

// Instance methods
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUserDocument

  return bcrypt.compare(candidatePassword, user.password).catch(() => false)
}

export default mongoose.model<IUserDocument>('User', userSchema)
