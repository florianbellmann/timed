import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { IDBService } from '../db/db.service'
import { TYPES } from '../dependency-injection/types'
import { logger } from '../logger'
import { IEntry, EntryType } from './entry'

export interface IEntryParser {
  getDbEntries(n?: number): IEntry[]
  insertNewEntryFromInput(input: any): void
  insertNewEntryFromTime(time: number): void

  getLastEntry(): IEntry
  getLastOvertime(): number

  // TODO: these 2 are actually the only functions that can be in a parsed service. the rest is a business layer
  parseDateString(dateString: string): string
  parseOvertime(overTime: number): string
}

@injectable()
export class EntryParser implements IEntryParser {
  private _dbService: IDBService

  constructor(@inject(TYPES.IDBService) dbService: IDBService) {
    this._dbService = dbService
  }

  parseDateString(dateString: string): string {
    try {
      const date = new Date(dateString)
      // return formatted date
      return date.toLocaleDateString('de')
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  parseOvertime(overTime: number): string {
    const hours = Math.floor(overTime / 60)
    const mins = overTime % 60
    return `${hours}h ${mins}m`
  }

  getLastEntry(): IEntry {
    const lastEntry = this._dbService.getLastEntry()
    const parsedEntry = this.parseDBEntry(lastEntry)
    return parsedEntry
  }

  getLastOvertime(): number {
    const lastEntry = this.getLastEntry()

    if (lastEntry != null) return this.getLastEntry().overTime
    else return 0
  }

  insertNewEntryFromTime(time: number): void {
    const id = randomUUID()
    const date = new Date(Date.now())
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000)

    const entryTime = time
    const entryType: EntryType = 'overtime'

    const overTime = this.getLastOvertime() + time

    this._dbService.appendEntry(`${id};${date.toUTCString()};${entryType};${entryTime};${overTime};`)
  }

  private parseDBEntry(dbEntry: string): IEntry {
    if (dbEntry == null || dbEntry === '' || dbEntry.length === 0) return null

    const parts = dbEntry.split(';')
    try {
      return {
        id: parts[0],
        date: parts[1],
        entryType: parts[2] as EntryType,
        entryTime: parts[3],
        overTime: parseInt(parts[4])
      }
    } catch (error) {
      logger.error(`Could not parse entry: ${dbEntry}`, error)
      return null
    }
  }

  getDbEntries(n?: number): IEntry[] {
    const entries = this._dbService.readLastEntries(n)

    return entries
      .map((entry) => this.parseDBEntry(entry))
      .sort((entryA, entryB) => {
        return entryA.date > entryB.date ? 1 : -1
      })
  }

  insertNewEntryFromInput(entry: IEntry): void {
    const { id, date, entryTime, entryType, overTime } = entry

    const entryDate = new Date(date)
    entryDate.setTime(entryDate.getTime() - entryDate.getTimezoneOffset() * 60 * 1000)

    let newOverTime: number = overTime

    if (entryType === 'end') {
      const last10Entries = this.getDbEntries(10)

      const endDate = new Date(date)
      if (last10Entries.length > 0) {
        for (let i = last10Entries.length - 1; i >= 0; i--) {
          const lastEntry = last10Entries[i]
          const lastDate = new Date(lastEntry.date)
          const lastHours = parseInt(lastEntry.entryTime.substring(0, 2))
          const lastMinutes = parseInt(lastEntry.entryTime.substring(3, 5))
          const normalizedLastDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), lastHours, lastMinutes)
          if (
            lastEntry.entryType === 'start' &&
            normalizedLastDate.getDate() === endDate.getDate() &&
            normalizedLastDate.getMonth() === endDate.getMonth() &&
            normalizedLastDate.getFullYear() === endDate.getFullYear()
          ) {
            console.log(lastEntry)

            const hoursWorked = (endDate.getTime() - normalizedLastDate.getTime()) / (1000 * 60 * 60)
            console.log(`hoursWorked`, hoursWorked)
            newOverTime = lastEntry.overTime + parseInt(entryTime)
            break
          }
        }
      }

      if (overTime == null) {
        newOverTime = this.getLastOvertime()
      }

      this._dbService.appendEntry(`${id};${entryDate.toUTCString()};${entryType};${entryTime};${newOverTime};`)
    }
  }
}
