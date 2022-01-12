import { inject, injectable } from 'inversify'
import { Cli } from './cli/cli'
import { IDBService } from './db/db.service'
import { TYPES } from './dependency-injection/types'
import { IEntry } from './entry.parser/entry'
import { EntryParser, IEntryParser } from './entry.parser/entry.parser'

export interface IApp {
  main(): Promise<void>
}

@injectable()
export class App implements IApp {
  private _cli: Cli
  private _entryParser: IEntryParser

  private _parsedEntries: IEntry[] = []
  private _accumulatedOvertime: string

  constructor(@inject(TYPES.IDBService) dbService: IDBService, @inject(TYPES.ICli) cli: Cli, @inject(TYPES.IEntryParser) entryParser: EntryParser) {
    this._cli = cli
    this._entryParser = entryParser

    this.reloadLastEntries()
  }

  reloadLastEntries(): void {
    this._parsedEntries = this._entryParser.getDbEntries()
  }

  displayLastEntries(): void {
    this._cli.displayLastEntries(this._parsedEntries)
  }

  waitForUserAction(): Promise<string> {
    this.displayLastEntries()
    this._cli.displayAccumulatedOvertime(this._accumulatedOvertime)

    return this._cli.readCommand()
  }

  async performAction(currentCommand: string): Promise<void> {
    switch (currentCommand) {
      case 'a':
        const timeToAppend = await this._cli.readAppendTime()
        this._entryParser.insertNewEntryFromTime(timeToAppend)
        break
      case 's':
        const timeToSubtract = await this._cli.readSubtractTime()
        this._entryParser.insertNewEntryFromTime(timeToSubtract * -1)
        break
      case 'r':
        this.reloadLastEntries()
        break
      case 'n':
        const newEntry = await this._cli.readNewEntry()
        this._entryParser.insertNewEntryFromInput(newEntry)
        this.reloadLastEntries()
        break
      // case 'R':
      //   await this.resetOvertime()
      //   break
      case 'q':
        this.quit()
        break
      default:
        this._cli.displayUnknownCommand()
        break
    }
  }

  async main(): Promise<void> {
    let currentCommand = ''

    // start command
    currentCommand = await this.waitForUserAction()

    // command app loop
    while (currentCommand !== 'q') {
      // eslint-disable-next-line no-await-in-loop
      await this.performAction(currentCommand)

      // eslint-disable-next-line no-await-in-loop
      currentCommand = await this.waitForUserAction()
    }

    this.quit()
  }

  quit(): void {
    process.exit(0)
  }
}
