/* eslint-disable no-unused-vars */
export interface IDBService {
  appendEntry(entry: string): void
  getEntries(n?: number): string[]
  getEntriesByUTCDate(utcDateString: string): string[]
  getLastEntry(): string
  setDBPath(filePath: string): void
}
