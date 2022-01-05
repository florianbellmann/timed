export interface IDBService {
  readFromDB(): string[]
  appendEntry(entry: string): void
  readLast50Entries(): string[]
  setDBPath(filePath: string): void
}
