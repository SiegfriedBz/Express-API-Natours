export default class AppError extends Error {
  statusCode: number
  statusText: 'fail' | 'error'
  isHandledDBError: boolean
  code: number | null
  name: string

  constructor({
    statusCode,
    message
  }: {
    statusCode: number
    message: string
  }) {
    super(message)
    this.statusCode = statusCode
    this.statusText = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isHandledDBError = false
    this.code = null
    this.name = ''

    Error.captureStackTrace(this, this.constructor)
  }
}
