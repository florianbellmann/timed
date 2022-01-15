export type EntryType = 'start' | 'end' | 'overtime'
export interface IEntry {
  id: string
  date: Date
  entryTime: number
  entryType: EntryType
  workedTime?: number
  overTime?: number
}
