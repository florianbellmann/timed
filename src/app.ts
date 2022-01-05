import { injectable } from 'inversify'
import { terminal } from 'terminal-kit'

export interface IApp {
  main(): Promise<void>
}

@injectable()
export class App implements IApp {
  // @inject(TYPES.ITrelloConnector) private _trelloConnector: TrelloConnector
  // @inject(TYPES.IStorageProvider) private _storageProvider: GlobalStateContext
  // @inject(TYPES.IActionProvider) private _actionHandler: ActionHandler
  // @inject(TYPES.ICliWrapper) private _cliWrapper: CliWrapper

  async main() {
    terminal('Please enter your name: ')

    terminal.inputField({ autoCompleteMenu: true }, function (error, input) {
      terminal.green("\nYour name is '%s'\n", input)
      process.exit()
    })

    process.exit(0)
  }
}
