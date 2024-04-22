import { ZodError } from 'zod'
import { MongoError } from 'mongodb'
import AppError from '../utils/AppError.utils'
import type { NextFunction, Request, Response } from 'express'

/**
 * Express middleware for handling errors.
 */
export default function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  let error = err

  // Zod ValidateRequest thrown error(s)
  if (error instanceof ZodError) {
    const errorMessage = []
    for (const issue of error.issues) {
      const { message, path } = issue
      if (message.startsWith('Expected')) {
        errorMessage.push(`${message} on ${path?.join(', ')}`)
      } else {
        errorMessage.push(message)
      }
    }
    if (errorMessage.length > 0) {
      error = handleZodError(errorMessage.join(', '))
    }
  }

  // MongoDB thrown error on DUP KEY
  if (error instanceof MongoError && error.code === 11000) {
    if (
      typeof error === 'object' &&
      error != null &&
      'keyValue' in error &&
      error.keyValue != null &&
      typeof error.keyValue === 'object' &&
      'name' in error.keyValue
    ) {
      error = handleDupKeyDBError(error as { keyValue: { name: string } })
    }
  }

  // Mongoose thrown error on INVALID ID
  if (error instanceof Error && error.name === 'CastError') {
    if (
      typeof error === 'object' &&
      error !== null &&
      'path' in error &&
      'value' in error
    ) {
      error = handleCastDBError(error as { path: string; value: string })
    }
  }

  /** Send Response */
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: error.statusText,
      error: { message: error.message }
    })
  } else {
    res.status(500).json({
      status: 'error',
      error: { message: 'Something went wrong' }
    })
  }
}

/** Helpers */
const handleZodError = (message: string) => {
  const error = new AppError({ statusCode: 400, message })

  return error
}

// DB Errors
const handleCastDBError = (err: { path: string; value: string }) => {
  const message = `Invalid ${err.path}: ${err.value}`
  const error = new AppError({ statusCode: 400, message })

  error.isHandledDBError = true

  return error
}

const handleDupKeyDBError = (err: { keyValue: { name: string } }) => {
  const fieldError =
    err?.keyValue?.name ||
    Object.keys(err?.keyValue)
      ?.map((key) => key)
      ?.join(', ')
  const message = `Duplicate field value on: ${fieldError}. Please use another value`
  const error = new AppError({ statusCode: 400, message })
  error.isHandledDBError = true

  return error
}
