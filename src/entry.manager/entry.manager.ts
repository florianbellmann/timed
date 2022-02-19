import { inject, injectable } from 'inversify'
import { IDBService } from '../db/db.service'
import { TYPES } from '../dependency-injection/types'
import { logger } from '../logger'
import { IEntry, EntryType } from './entry'

export interface IEntryManager {
  // eslint-disable-next-line no-unused-vars
  appendEntry: (entry: IEntry) => void
  // eslint-disable-next-line no-unused-vars
  calculateWorkForEndDate(endDate: Date, endEntryTime: number): number
  // eslint-disable-next-line no-unused-vars
  getEntries(count?: number): IEntry[]
  // eslint-disable-next-line no-unused-vars
  getEntriesByDate(date: Date): IEntry[]
  getLastEntry(): IEntry
  getLastOvertime(): number
  isFirstEntryOfToday(): boolean
  // eslint-disable-next-line no-unused-vars
  convertToHumanDate(dateString: string): string
  // eslint-disable-next-line no-unused-vars
  parseOvertime(overTime: number): string
}

@injectable()
export class EntryManager implements IEntryManager {
  private _dbService: IDBService

  constructor(@inject(TYPES.IDBService) dbService: IDBService) {
    this._dbService = dbService
  }

  appendEntry(entry: IEntry) {
    const { id, date, entryTime, entryType, overTime, workedTime } = entry
    this._dbService.appendEntry(`${id};${date.toUTCString()};${entryTime};${workedTime};${entryType};${overTime};`)
  }

  // TODO: remove this method if not used
  convertToHumanDate(dateString: string): string {
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

  private parseDBEntry(dbEntry: string): IEntry {
    if (dbEntry == null || dbEntry === '' || dbEntry.length === 0) return null

    const parts = dbEntry.split(';')

    try {
      return {
        id: parts[0],
        date: new Date(parts[1]),
        entryTime: parseInt(parts[2], 10),
        workedTime: parseInt(parts[3]),
        entryType: parts[4] as EntryType,
        overTime: parseInt(parts[5]) || 0
      }
    } catch (error) {
      logger.error(`Could not parse entry: ${dbEntry}`, error)
      return null
    }
  }

  getEntries(count?: number): IEntry[] {
    const entries = this._dbService.getEntries(count)

    return entries
      .map((entry) => this.parseDBEntry(entry))
      .sort((entryA, entryB) => {
        return entryA.date > entryB.date ? 1 : -1
      })
  }

  calculateWorkForEndDate(endDate: Date, endEntryTime: number): number {
    const fullEndTimeString = `${endEntryTime}`.length === 3 ? `0${endEntryTime}` : `${endEntryTime}`
    const endHours = parseInt(`${fullEndTimeString}`.substring(0, 2))
    const endMinutes = parseInt(`${fullEndTimeString}`.substring(2, 4))

    const last10Entries = this.getEntries(10)
    let workedTime = 0

    const startsToday = []
    if (last10Entries.length > 0) {
      for (let i = 0; i < last10Entries.length; i++) {
        try {
          const lastEntry = last10Entries[i]
          if (lastEntry == null) continue

          const lastDate = new Date(lastEntry.date)
          const fullLastTimeString = `${lastEntry.entryTime}`.length === 3 ? `0${lastEntry.entryTime}` : `${lastEntry.entryTime}`
          const lastHours = parseInt(`${fullLastTimeString}`.substring(0, 2))
          const lastMinutes = parseInt(`${fullLastTimeString}`.substring(2, 4))
          if (
            endDate != null &&
            lastEntry.entryType === 'start' &&
            lastDate.getDate() === endDate.getDate() &&
            lastDate.getMonth() === endDate.getMonth() &&
            lastDate.getFullYear() === endDate.getFullYear() &&
            lastHours != null &&
            !isNaN(lastHours) &&
            lastMinutes != null &&
            !isNaN(lastMinutes)
          ) {
            startsToday.push(lastEntry)
          }
        } catch (error) {
          logger.error(error)
        }
      }
    }

    if (startsToday.length > 0) {
      const entryToLookAt = startsToday.sort((entryA, entryB) => {
        if (entryA == null || entryB == null) return 0
        return entryA.entryTime < entryB.entryTime ? 1 : -1
      })[0]

      const fullLastTimeString = `${entryToLookAt.entryTime}`.length === 3 ? `0${entryToLookAt.entryTime}` : `${entryToLookAt.entryTime}`
      const lastHours = parseInt(`${fullLastTimeString}`.substring(0, 2))
      const lastMinutes = parseInt(`${fullLastTimeString}`.substring(2, 4))
      const diffHours = lastMinutes > endMinutes ? endHours - lastHours - 1 : endHours - lastHours
      const diffMinutes = lastMinutes > endMinutes ? 60 - lastMinutes + endMinutes : endMinutes - lastMinutes
      workedTime = 60 * diffHours + diffMinutes
    }

    return workedTime
  }

  isFirstEntryOfToday(): boolean {
    const last10Entries = this.getEntries(10)
    if (last10Entries.length === 0) return true

    const today = new Date()

    for (const lastEntry of last10Entries) {
      if (lastEntry == null) continue

      const lastDate = lastEntry.date
      if (lastDate.getFullYear() === today.getFullYear() && lastDate.getMonth() === today.getMonth() && lastDate.getDate() === today.getDate()) return false
    }
    return true
  }

  getEntriesByDate(searchDate: Date): IEntry[] {
    const entriesByDate = []

    const last10Entries = this.getEntries(10)
    if (last10Entries.length === 0) return []

    for (const lastEntry of last10Entries) {
      if (lastEntry == null) continue

      try {
        const lastDate = lastEntry.date
        if (lastDate.getFullYear() === searchDate.getFullYear() && lastDate.getMonth() === searchDate.getMonth() && lastDate.getDate() === searchDate.getDate())
          entriesByDate.push(lastEntry)
      } catch (error) {
        logger.error(error)
        continue
      }
    }

    return entriesByDate
  }
}
