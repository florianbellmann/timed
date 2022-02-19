import { randomUUID } from 'crypto'
import { inject, injectable } from 'inversify'
import { TYPES } from '../dependency-injection/types'
import { EntryType, IEntry } from '../entry.manager/entry'
import { IEntryManager } from '../entry.manager/entry.manager'

export interface IBusinessLayer {
  // eslint-disable-next-line no-unused-vars
  insertNewEntryFromInput(entry: IEntry): void
  // eslint-disable-next-line no-unused-vars
  insertNewEntryFromTime(time: number): void
  // eslint-disable-next-line no-unused-vars
  getEntries(count?: number): IEntry[]
}

@injectable()
export class BusinessLayer implements IBusinessLayer {
  private _entryManager: IEntryManager

  constructor(@inject(TYPES.IEntryManager) entryManager: IEntryManager) {
    this._entryManager = entryManager
  }

  getEntries(count?: number): IEntry[] {
    return this._entryManager.getEntries(count)
  }

  insertNewEntryFromTime(time: number): void {
    const id = randomUUID()
    const date = new Date(Date.now())
    // fix timezone
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000)

    const entryTime = -1
    const workedTime = time
    const entryType: EntryType = 'overtime'

    const overTime = this._entryManager.getLastOvertime() + time

    this._entryManager.appendEntry({
      id,
      date,
      entryTime,
      workedTime,
      entryType,
      overTime
    })
  }

  insertNewEntryFromInput(entry: IEntry): void {
    const { id, date, entryTime, entryType, overTime } = entry

    const newEntryDate = new Date(date)
    // fix timezone
    newEntryDate.setTime(newEntryDate.getTime() - newEntryDate.getTimezoneOffset() * 60 * 1000)

    let workedTime = 0
    if (entryType === 'end') {
      workedTime = this._entryManager.calculateWorkForEndDate(newEntryDate, entryTime)
    }

    // calc overtime
    let newOverTime: number = overTime

    if (overTime == null) {
      newOverTime = this._entryManager.getLastOvertime()
    }
    if (entryType === 'overtime') {
      newOverTime = newOverTime + entryTime
    }

    if (isNaN(newOverTime)) {
      newOverTime = 0
    }

    this._entryManager.appendEntry({
      id,
      date,
      entryTime,
      workedTime,
      entryType,
      overTime: newOverTime
    })
  }
}
