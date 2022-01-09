export interface IDBService {
  appendEntry(entry: string): void
  readLastEntries(n?: number): string[]
  setDBPath(filePath: string): void
  getLastEntry(): string
}
