import { inject, injectable } from 'inversify'
import { Cli, SingleColumnMenuResponse } from './cli/cli'
import { TYPES } from './dependency-injection/types'
import { BusinessLayer, IBusinessLayer } from './business.layer/business.layer'
import { IEntry } from './entry.manager/entry'

export interface IApp {
  displayLastEntries(): void
  main(): Promise<void>
  // eslint-disable-next-line no-unused-vars
  performAction(currentCommand: string): Promise<void>
  quit(): void
  reloadLastEntries(): void
  waitForUserAction(): Promise<SingleColumnMenuResponse>
}

@injectable()
export class App implements IApp {
  private _cli: Cli
  private _businessLayer: IBusinessLayer

  private _parsedEntries: IEntry[] = []
  private _accumulatedOvertime: string

  constructor(@inject(TYPES.ICli) cli: Cli, @inject(TYPES.IBusinessLayer) businessLayer: BusinessLayer) {
    this._cli = cli
    this._businessLayer = businessLayer

    this.reloadLastEntries()
  }

  reloadLastEntries(): void {
    this._parsedEntries = this._businessLayer.getEntries()
  }

  displayLastEntries(): void {
    this._cli.displayLastEntries(this._parsedEntries)
  }

  waitForUserAction(): Promise<SingleColumnMenuResponse> {
    this.displayLastEntries()
    this._cli.displayAccumulatedOvertime(this._accumulatedOvertime)

    return this._cli.readCommand()
  }

  async performAction(currentCommand: string): Promise<void> {
    switch (currentCommand) {
      case 'a':
        const timeToAppend = await this._cli.readAppendTime()
        this._businessLayer.insertNewEntryFromTime(timeToAppend)
        break
      case 'w':
        const timeToSubtract = await this._cli.readSubtractTime()
        this._businessLayer.insertNewEntryFromTime(timeToSubtract * -1)
        break
      case 'r':
        this.reloadLastEntries()
        break
      case 's':
        const newStartEntry = await this._cli.readNewEntry('start')
        this._businessLayer.insertNewEntryFromInput(newStartEntry)
        this.reloadLastEntries()
        break
      case 'e':
        const newEndEntry = await this._cli.readNewEntry('end')
        this._businessLayer.insertNewEntryFromInput(newEndEntry)
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
    currentCommand = await (await this.waitForUserAction()).key

    // command app loop
    while (currentCommand !== 'q') {
      // eslint-disable-next-line no-await-in-loop
      await this.performAction(currentCommand)

      // eslint-disable-next-line no-await-in-loop
      currentCommand = await (await this.waitForUserAction()).key
    }

    this.quit()
  }

  quit(): void {
    process.exit(0)
  }
}
