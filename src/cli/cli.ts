import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { terminal } from 'terminal-kit'
import { TYPES } from '../dependency-injection/types'
import { EntryType, IEntry } from '../business.layer/entry'
import { IBusinessLayer, BusinessLayer } from '../business.layer/business.layer'
import { logger } from '../logger'

export interface ICli {
  // eslint-disable-next-line no-unused-vars
  displayLastEntries(entries: IEntry[]): void
  // eslint-disable-next-line no-unused-vars
  displayAccumulatedOvertime(time: string): void
  displayUnknownCommand(): void

  readCommand(): Promise<string>
  readAppendTime(): Promise<number>
  readSubtractTime(): Promise<number>
  readNewEntry(): Promise<IEntry>
}

@injectable()
export class Cli implements ICli {
  private _businessLayer: IBusinessLayer

  constructor(@inject(TYPES.IBusinessLayer) businessLayer: BusinessLayer) {
    this._businessLayer = businessLayer
  }

  displayLastEntries(entries: IEntry[]): void {
    const displayEntries = entries
      .filter((entry) => entry != null)
      .map((entry) => [
        this._businessLayer.parseDateString(entry.date),
        entry.entryTime,
        this._businessLayer.parseOvertime(entry.workedTime),
        this._businessLayer.parseOvertime(entry.overTime),
        entry.entryType,
        entry.id
      ])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(terminal as any).table(displayEntries, {
      hasBorder: true,
      contentHasMarkup: true,
      borderChars: 'lightRounded',
      borderAttr: { color: 'blue' },
      textAttr: { bgColor: 'default' },
      width: 60,
      fit: true
    })
  }

  displayAccumulatedOvertime(overTime: string): void {
    terminal(`The current overtime is ${overTime}`)
  }

  displayUnknownCommand(): void {
    terminal('Unknown command. Please try again.')
  }

  readCommand(): Promise<string> {
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
    let entryTime = await terminal.inputField({}).promise
    if (entryTime.length === 3) {
      entryTime = `0${entryTime}`
    }

    terminal('Please enter the day: ')

    const days = ['Today', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const entryDay = await (await terminal.singleLineMenu(days).promise).selectedText

    let entryDate = new Date()
    switch (entryDay) {
      case 'Monday':
        const prevMonday = new Date()
        prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7))
        entryDate = prevMonday
        break
      case 'Tuesday':
        const prevTuesday = new Date()
        prevTuesday.setDate(prevTuesday.getDate() - ((prevTuesday.getDay() + 5) % 7))
        entryDate = prevTuesday
        break
      case 'Wednesday':
        const prevWednesday = new Date()
        prevWednesday.setDate(prevWednesday.getDate() - ((prevWednesday.getDay() + 4) % 7))
        entryDate = prevWednesday
        break
      case 'Thursday':
        const prevThursday = new Date()
        prevThursday.setDate(prevThursday.getDate() - ((prevThursday.getDay() + 3) % 7))
        entryDate = prevThursday
        break
      case 'Friday':
        const prevFriday = new Date()
        prevFriday.setDate(prevFriday.getDate() - ((prevFriday.getDay() + 2) % 7))
        entryDate = prevFriday
        break
      case 'Saturday':
        const prevSaturday = new Date()
        prevSaturday.setDate(prevSaturday.getDate() - ((prevSaturday.getDay() + 1) % 7))
        entryDate = prevSaturday
        break
      case 'Sunday':
        const prevSunday = new Date()
        prevSunday.setDate(prevSunday.getDate() - (prevSunday.getDay() % 7))
        entryDate = prevSunday
        break

      default:
        break
    }
    try {
      const entryHours = parseInt(entryTime.substring(0, 2), 10)
      const entryMinutes = parseInt(entryTime.substring(2, 4), 10)
      entryDate.setHours(entryHours, entryMinutes, 0, 0)
    } catch (error) {
      logger.error(error)
    }

    const id = randomUUID()

    return {
      id,
      date: entryDate.toISOString(),
      entryTime,
      entryType
    }
  }
}
