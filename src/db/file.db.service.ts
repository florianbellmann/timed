import * as path from 'path'
import * as fs from 'fs'
import { IDBService } from './db.service'
import { injectable } from 'inversify'
import { logger } from '../logger'

@injectable()
export class FileDBService implements IDBService {
  private filePath = path.resolve(process.cwd(), 'timelog.csv')

  constructor() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '')
    }
  }

  private readFromDB(): string[] {
    try {
      return fs.readFileSync(this.filePath, 'utf8').split('\n')
    } catch (error) {
      logger.error(error)
      return []
    }
  }

  getLastEntry(): string {
    const fileContents = this.readFromDB()
    try {
      return fileContents[fileContents.length - 1]
    } catch (error) {
      logger.error(error)
      return null
    }
  }

  setDBPath(filePath: string): void {
    this.filePath = filePath
  }

  appendEntry(entry: string): void {
    try {
      fs.appendFileSync(this.filePath, `\n${entry}`)

      const trimmedFileContent = fs
        .readFileSync(this.filePath, 'utf-8')
        .split('\n')
        .filter((line) => line !== '')

      fs.writeFileSync(this.filePath, trimmedFileContent.join('\n'))
    } catch (error) {
      logger.error(error)
    }
  }

  // eslint-disable-next-line id-length
  getEntries(n?: number): string[] {
    const count = n || 10
    const fileContents = this.readFromDB()
    try {
      return fileContents.slice(-count)
    } catch (error) {
      logger.error(error)
      return fileContents
    }
  }

  getEntriesByUTCDate(utcDateString: string): string[] {
    const dbEntries = this.readFromDB()
    return dbEntries.filter((dbEntry) => dbEntry.includes(utcDateString))
  }
}
