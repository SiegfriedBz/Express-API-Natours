import mongoose from 'mongoose'

export type TUserRole = 'admin' | 'lead-guide' | 'guide' | 'user'

export interface IUserDBInput {
  name: string
  email: string
  password: string
  photo?: string
  role: TUserRole
}
export interface IUserDocument extends IUserDBInput, mongoose.Document {
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  passwordChangedAt: Date
  passwordResetToken: string
  passwordResetTokenExpiresAt: Date
  comparePassword: (candidatePassword: string) => Promise<boolean>
  createPasswordResetToken: () => string
}
