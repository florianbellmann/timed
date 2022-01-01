import * as winston from 'winston'

const transports = {
  console: new winston.transports.Console({ level: 'warn' }),
  file: new winston.transports.File({ filename: 'app.log', level: 'info' })
}

const { combine, timestamp, prettyPrint } = winston.format

export const logger = winston.createLogger({
  transports: [transports.console, transports.file],
  format: combine(timestamp(), prettyPrint())
})
