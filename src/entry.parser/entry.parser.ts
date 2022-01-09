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
    return this.getLastEntry().overTime || 0
  }

  insertNewEntryFromTime(time: number): void {
    const id = randomUUID()
    const date = Date.now
    const entryTime = time
    const entryType: EntryType = 'overtime'

    const overTime = this.getLastOvertime() + time

    this._dbService.appendEntry(`${id};${date};${entryType};${entryTime};${overTime};`)
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

    let newOverTime = overTime
    if (overTime == null) {
      newOverTime = this.getLastOvertime()
    }

    this._dbService.appendEntry(`${id};${date};${entryType};${entryTime};${newOverTime};`)
  }
}
