import config from 'config'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUserInput {
  name: string
  email: string
  password: string
}
export interface IUserDocument extends IUserInput, mongoose.Document {
  createdAt: Date
  updatedAt: Date
  comparePassword: (candidatePassword: string) => Promise<boolean>
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true }
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
