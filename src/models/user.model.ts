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
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
)

userSchema.pre('save', async (next) => {
  const user = this as unknown as IUserDocument

  if (!user?.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(config.get<number>('bcrypt.saltWorkFactor'))
  const hashPassword: string = await bcrypt.hash(user.password, salt)

  user.password = hashPassword

  next()
})

export default mongoose.model('User', userSchema)
