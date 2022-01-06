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
  private _dbService: IDBService
  private _entryParser: IEntryParser

  private _loadedLastEntries: string[] = []
  private _parsedEntries: IEntry[] = []
  private _accumulatedOvertime: string

  constructor(@inject(TYPES.IDBService) dbService: IDBService, @inject(TYPES.ICli) cli: Cli, @inject(TYPES.IEntryParser) entryParser: EntryParser) {
    this._cli = cli
    this._entryParser = entryParser
    this._dbService = dbService

    this.reloadLastEntries()
    this.loadAccumulatedOvertime()
  }

  reloadLastEntries(): void {
    this._loadedLastEntries = this._dbService.readLast50Entries()
    this._parsedEntries = this._entryParser.parseDBEntries(this._loadedLastEntries)
  }

  loadAccumulatedOvertime(): void {
    // const allEntries = this._dbService.readFromDB()
    // TODO: strip out overtimes
    // TODO:maybe the formatting needs to happen in the entryparser! it uses the formatter then
    // const overtimes = allEntries.filter((entry) => entry.includes('overtime'))
    // throw new Error('Not implemented')
    // TODO: format overtime
    // this._accumulatedOvertime = this._timeFormatter.
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
        const newAppendOnlyEntry = this._entryParser.newDBEntryFromTime(timeToAppend)
        this._dbService.appendEntry(newAppendOnlyEntry)
        break
      case 's':
        const timeToSubtract = await this._cli.readSubtractTime()
        const newSubtractOnlyEntry = this._entryParser.newDBEntryFromTime(timeToSubtract)
        this._dbService.appendEntry(newSubtractOnlyEntry)
        break
      case 'r':
        this.reloadLastEntries()
        break
      case 'n':
        const newEntryString = await this._cli.readNewEntry()
        const parsedEntry = this._entryParser.newDBEntryFromInput(newEntryString)
        this._dbService.appendEntry(parsedEntry)
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
