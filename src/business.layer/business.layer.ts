import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { IDBService } from '../db/db.service'
import { TYPES } from '../dependency-injection/types'
import { logger } from '../logger'
import { IEntry, EntryType } from './entry'

export interface IBusinessLayer {
  getDbEntries(count?: number): IEntry[]
  insertNewEntryFromInput(input: any): void
  insertNewEntryFromTime(time: number): void

  getLastEntry(): IEntry
  getLastOvertime(): number

  parseDateString(dateString: string): string
  parseOvertime(overTime: number): string
}

@injectable()
export class BusinessLayer implements IBusinessLayer {
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

    this._dbService.appendEntry(`${id};${date.toUTCString()};${entryTime};${entryTime},${entryType};${overTime};`)
  }

  private parseDBEntry(dbEntry: string): IEntry {
    if (dbEntry == null || dbEntry === '' || dbEntry.length === 0) return null

    const parts = dbEntry.split(';')
    try {
      return {
        id: parts[0],
        date: parts[1],
        entryType: parts[4] as EntryType,
        workedTime: parseInt(parts[3]),
        entryTime: parts[2],
        overTime: parseInt(parts[5])
      }
    } catch (error) {
      logger.error(`Could not parse entry: ${dbEntry}`, error)
      return null
    }
  }

  getDbEntries(count?: number): IEntry[] {
    const entries = this._dbService.readLastEntries(count)

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
    let workedTime = 0
    if (entryType === 'end') {
      const last10Entries = this.getDbEntries(10)

      const endDate = new Date(date)
      if (last10Entries.length > 0) {
        for (let i = last10Entries.length - 1; i >= 0; i--) {
          try {
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
              workedTime = (endDate.getTime() - normalizedLastDate.getTime()) / (1000 * 60 * 60)
              workedTime = workedTime * 60
              break
            }
          } catch (error) {
            logger.error(error)
          }
        }
      }
    }

    if (overTime == null) {
      newOverTime = this.getLastOvertime()
    }
    if (isNaN(newOverTime)) {
      newOverTime = 0
    }
    this._dbService.appendEntry(`${id};${entryDate.toUTCString()};${entryTime};${workedTime};${entryType};${newOverTime};`)
  }
}
