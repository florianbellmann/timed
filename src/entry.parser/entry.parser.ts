import { randomUUID } from 'crypto'
import { injectable } from 'inversify'
import { logger } from '../logger'
import { IEntry, EntryType } from './entry'

export interface IEntryParser {
  parseDBEntry(entry: string): IEntry
  parseDBEntries(entries: string[]): IEntry[]
  newDBEntryFromInput(input: any): string
  newDBEntryFromTime(time: number): string
}

@injectable()
export class EntryParser implements IEntryParser {
  newDBEntryFromTime(time: number): string {
    const id = randomUUID()
    const date = Date.now
    const entryTime = time
    const entryType: EntryType = 'overtime'
    // TODO: actually calculate this
    const overHours = '0'

    return `${id};${date};${entryType};${entryTime};${overHours};`
  }

  parseDBEntry(dbEntry: string): IEntry {
    if (dbEntry == null || dbEntry === '' || dbEntry.length === 0) return null

    const parts = dbEntry.split(';')
    try {
      return {
        id: parts[0],
        date: parts[1],
        entryType: parts[2] as EntryType,
        entryTime: parts[3],
        overHours: parts[4]
      }
    } catch (error) {
      logger.error(`Could not parse entry: ${dbEntry}`, error)
      return null
    }
  }

  parseDBEntries(entries: string[]): IEntry[] {
    return entries.map((entry) => this.parseDBEntry(entry))
  }

  newDBEntryFromInput(entry: IEntry): string {
    const { id, date, entryTime, entryType, overHours } = entry
    return `${id};${date};${entryType};${entryTime};${overHours};`
  }
}
