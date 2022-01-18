import { IApp } from './app'
import { container } from './dependency-injection/container'
import { TYPES } from './dependency-injection/types'
import { logger } from './logger'

if (process.env.NODE_ENV !== 'test') {
  process.on('uncaughtException', function (err) {
    if (err) {
      logger.error(`caughtException but no error msg${err.stack}`)
      process.exit(1)
    }
  })
}

function bootstrap() {
  try {
    const app = container.get<IApp>(TYPES.IApp)

    app.main()
  } catch (error) {
    logger.error(error)
  }
}

bootstrap()
