import pino, { Logger } from 'pino'

let logger: Logger
if (process.env.NODE_ENV === 'production') {
  logger = pino()
} else {
  logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  })
}

export default logger
