import { logger } from './logger'
import { terminal } from 'terminal-kit'

process.on('uncaughtException', function (err) {
  if (err) {
    logger.error(`caughtException but no error msg${err.stack}`)
    process.exit(1)
  }
})

function main() {
  try {
    terminal('Please enter your name: ')

    terminal.inputField({ autoCompleteMenu: true }, function (error, input) {
      terminal.green("\nYour name is '%s'\n", input)
      process.exit()
    })
  } catch (error) {
    logger.error(error)
  }
}

main()
