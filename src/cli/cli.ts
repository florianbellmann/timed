import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { terminal } from 'terminal-kit'
import { TYPES } from '../dependency-injection/types'
import { EntryType, IEntry } from '../entry.parser/entry'
import { IEntryParser, EntryParser } from '../entry.parser/entry.parser'
import { logger } from '../logger'

export interface ICli {
  displayLastEntries(entries: IEntry[]): void
  displayAccumulatedOvertime(time: string): void
  displayUnknownCommand(): void

  readCommand(): Promise<string>
  readAppendTime(): Promise<number>
  readSubtractTime(): Promise<number>
  readNewEntry(): Promise<IEntry>
}

@injectable()
export class Cli implements ICli {
  private _entryParser: IEntryParser

  constructor(@inject(TYPES.IEntryParser) entryParser: EntryParser) {
    this._entryParser = entryParser
  }

  displayLastEntries(entries: IEntry[]): void {
    const displayEntries = entries
      .filter((entry) => entry != null)
      .map((entry) => [this._entryParser.parseDateString(entry.date), entry.entryType, entry.entryTime, this._entryParser.parseOvertime(entry.overTime), entry.id])
    ;(terminal as any).table(displayEntries, {
      hasBorder: true,
      contentHasMarkup: true,
      borderChars: 'lightRounded',
      borderAttr: { color: 'blue' },
      textAttr: { bgColor: 'default' },
      // firstCellTextAttr: { bgColor: 'blue' },
      // firstRowTextAttr: { bgColor: 'yellow' },
      // firstColumnTextAttr: { bgColor: 'red' },
      width: 60,
      fit: true // Activate all expand/shrink + wordWrap
    })
  }

  displayAccumulatedOvertime(overTime: string): void {
    terminal(`The current overtime is ${overTime}`)
  }

  displayUnknownCommand(): void {
    terminal('Unknown command. Please try again.')
  }

  readCommand(): Promise<string> {
    // TODO: color this
    terminal(`Commands: \n
    n: new entry \n
    r: refresh \n
    // R: reset overtime \n
    a: add to overtime \n
    s: subtract from overtime \n
    q: quit \n`)
    return terminal.inputField({}).promise
  }

  async readAppendTime(): Promise<number> {
    terminal('Please enter the time you want to add to the overtime: ')
    try {
      const time = await terminal.inputField({}).promise
      return parseInt(time, 10)
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async readSubtractTime(): Promise<number> {
    terminal('Please enter the time you want to subtract from the overtime: ')
    try {
      const time = await terminal.inputField({}).promise
      return parseInt(time, 10)
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async readNewEntry(): Promise<IEntry> {
    terminal('Please enter the new entry: ')

    // get type
    const availableTypes: EntryType[] = ['start', 'end', 'overtime']
    const entryType = (await terminal.singleLineMenu(availableTypes).promise).selectedText as EntryType

    terminal('Please enter the time (e.g. 1300): ')
    const entryTime = (await terminal.inputField({}).promise) as any

    terminal('Please enter the day: ')
    // TODO: today is missing
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const entryDay = await terminal.singleLineMenu(days).promise

    // TODO: get date from day. see date helper from other project
    // TODO: wrong time zone
    const entryDate = new Date().toISOString()

    const id = randomUUID()

    return {
      id,
      date: entryDate,
      entryTime,
      entryType
    }
  }
}
