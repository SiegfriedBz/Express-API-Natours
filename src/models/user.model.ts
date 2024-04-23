import 'dotenv/config'
import config from 'config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { USER_ROLES } from '../zodSchema/user.zodSchema'
import type { IUserDocument } from '../types/user.types'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: `User role must be chosen between ${USER_ROLES.join(', ')}`
      },
      default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date
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

userSchema.methods.createPasswordResetToken = function () {
  // get rdm string
  const resetToken = crypto.randomBytes(32).toString('hex')

  // light-hash
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.passwordResetTokenExpiresAt =
    Date.now() +
    parseInt(
      config.get<number>('tokens.passwordResetToken.expiresIn').toString(),
      10
    )

  return resetToken
}

export default mongoose.model<IUserDocument>('User', userSchema)
