import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { terminal } from 'terminal-kit'
import { TYPES } from '../dependency-injection/types'
import { IEntry, EntryType } from '../entry.manager/entry'
import { IEntryManager, EntryManager } from '../entry.manager/entry.manager'
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
  private _entryManager: IEntryManager

  constructor(@inject(TYPES.IEntryManager) entryManager: EntryManager) {
    this._entryManager = entryManager
  }

  private paintBright(text: string) {
    return `\x1b[1m${text}\x1b[0m`
  }
  private paintDim(text: string) {
    return `\x1b[2m${text}\x1b[0m`
  }
  private paintUnderscore(text: string) {
    return `\x1b[4m${text}\x1b[0m`
  }
  private paintBlink(text: string) {
    return `\x1b[5m${text}\x1b[0m`
  }
  private paintReverse(text: string) {
    return `\x1b[7m${text}\x1b[0m`
  }
  private paintHidden(text: string) {
    return `\x1b[8m${text}\x1b[0m`
  }
  private paintFgBlack(text: string) {
    return `\x1b[30m${text}\x1b[0m`
  }
  private paintFgRed(text: string) {
    return `\x1b[31m${text}\x1b[0m`
  }
  private paintFgGreen(text: string) {
    return `\x1b[32m${text}\x1b[0m`
  }
  private paintFgYellow(text: string) {
    return `\x1b[33m${text}\x1b[0m`
  }
  private paintFgBlue(text: string) {
    return `\x1b[34m${text}\x1b[0m`
  }
  private paintFgMagenta(text: string) {
    return `\x1b[35m${text}\x1b[0m`
  }
  private paintFgCyan(text: string) {
    return `\x1b[36m${text}\x1b[0m`
  }
  private paintFgWhite(text: string) {
    return `\x1b[37m${text}\x1b[0m`
  }
  private paintBgBlack(text: string) {
    return `\x1b[40m${text}\x1b[0m`
  }
  private paintBgRed(text: string) {
    return `\x1b[41m${text}\x1b[0m`
  }
  private paintBgGreen(text: string) {
    return `\x1b[42m${text}\x1b[0m`
  }
  private paintBgYellow(text: string) {
    return `\x1b[43m${text}\x1b[0m`
  }
  private paintBgBlue(text: string) {
    return `\x1b[44m${text}\x1b[0m`
  }
  private paintBgMagenta(text: string) {
    return `\x1b[45m${text}\x1b[0m`
  }
  private paintBgCyan(text: string) {
    return `\x1b[46m${text}\x1b[0m`
  }
  private bgWhite(text: string) {
    return `\x1b[47m${text}\x1b[0m`
  }

  private adjustStringWidth(str: string, width: number) {
    const strWidth = str.length
    if (strWidth > width) {
      return `${str.substring(0, width - 3)}…`
    } else if (strWidth < width) {
      return `${str}${' '.repeat(width - strWidth)}`
    } else {
      return str
    }
  }
  private cleanText(str: string): string {
    if (str === '-1') {
      return ''
    }
    const cleanString = `${str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' ').replace('-1h ', '').trim().substring(0, 100)}`
    const result = str.length > 100 ? `${cleanString}...` : cleanString
    return result
  }

  displayLastEntries(entries: IEntry[]): void {
    let displayEntries = entries
      .filter((entry) => entry != null)
      .map((entry) => [
        entry.date.toLocaleDateString('de'),
        entry.entryTime,
        entry.entryType,
        this._entryManager.parseOvertime(entry.workedTime),
        this._entryManager.parseOvertime(entry.overTime),
        // this._entryManager.calculateWorkForEndDate(entry.date),
        entry.id
      ])
    displayEntries = [['Date', 'Entry Time', 'Entry Type', 'Worked Time', 'Overtime', 'ID'], ...displayEntries]

    let dateWidth = 0,
      timeWidth = 0,
      typeWidth = 0,
      workedWidth = 0,
      overtimeWidth = 0

    displayEntries.forEach((item) => {
      if (item[0] != null) {
        const dateText = this.cleanText(item[0].toString())
        dateWidth = Math.max(dateWidth, dateText.length)
      }
      if (item[1] != null) {
        const timeText = this.cleanText(item[1].toString())
        timeWidth = Math.max(timeWidth, timeText.length)
      }
      if (item[2] != null) {
        const typeText = this.cleanText(item[2].toString())
        typeWidth = Math.max(typeWidth, typeText.length)
      }
      if (item[3] != null) {
        const workedText = this.cleanText(item[3].toString())
        workedWidth = Math.max(workedWidth, workedText.length)
      }
      if (item[4] != null) {
        const overtimeText = this.cleanText(item[4].toString())
        overtimeWidth = Math.max(overtimeWidth, overtimeText.length)
      }
    })

    const itemStrings = displayEntries.map((item, index) => {
      const lastItem = displayEntries[index - 1]
      let resultString = ''

      if (index !== 0 && lastItem != null && lastItem[0] !== item[0]) {
        resultString += '\n'
      }

      resultString += `${this.paintFgRed(this.adjustStringWidth(this.cleanText(item[0].toString()), dateWidth))} ${this.paintFgGreen(
        this.adjustStringWidth(this.cleanText(item[1].toString()), timeWidth)
      )} ${this.paintFgYellow(this.adjustStringWidth(this.cleanText(item[2].toString()), typeWidth))} ${this.paintFgBlue(
        this.adjustStringWidth(this.cleanText(item[3].toString()), workedWidth)
      )} ${this.paintFgMagenta(this.adjustStringWidth(this.cleanText(item[4].toString()), overtimeWidth))}`

      return resultString
    })

    // eslint-disable-next-line no-console
    itemStrings.forEach((itemString) => console.log(itemString))

    // // fix for broken terminal-kit types
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // ;(terminal as any).table(displayEntries, {
    //   hasBorder: true,
    //   contentHasMarkup: true,
    //   borderChars: 'lightRounded',
    //   borderAttr: { color: 'blue' },
    //   textAttr: { bgColor: 'default' },
    //   fit: true
    // })
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
    return terminal.inputField({
      keyBindings: {
        ENTER: 'submit'
      }
    }).promise
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

  private async readEntryType(): Promise<EntryType> {
    try {
      const availableTypes: EntryType[] = ['start', 'end', 'overtime']
      return (await terminal.singleLineMenu(availableTypes).promise).selectedText as EntryType
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  private async readEntryTime(): Promise<number> {
    try {
      terminal('Please enter the time (e.g. 1300): ')
      let entryTimeString = await terminal.inputField({}).promise
      if (entryTimeString.length === 3) {
        entryTimeString = `0${entryTimeString}`
      }
      return parseInt(entryTimeString, 10)
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  private async readEntryDate(): Promise<Date> {
    try {
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
      return entryDate
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  async readNewEntry(): Promise<IEntry> {
    terminal('Please enter the new entry: ')

    const id = randomUUID()

    const entryType = await this.readEntryType()

    const entryTime = await this.readEntryTime()

    const entryDate = await this.readEntryDate()

    return {
      id,
      date: entryDate,
      entryTime,
      entryType
    }
  }
}
