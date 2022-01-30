export type EntryType = 'start' | 'end' | 'overtime'
export interface IEntry {
  id: string // id of the entry
  date: Date // time of adding this to the database
  entryTime: number // time of the entry or -1 for overtime entries
  entryType: EntryType // type of the entry: start, end, overtime
  workedTime?: number // time worked in minutes or overtime
  overTime?: number // current calculated overtime
}
