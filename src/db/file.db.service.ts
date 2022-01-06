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
  setDBPath(filePath: string): void {
    this.filePath = filePath
  }

  readFromDB(): string[] {
    try {
      return fs.readFileSync(this.filePath, 'utf8').split('\n')
    } catch (error) {
      logger.error(error)
      return []
    }
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

  readLast50Entries(): string[] {
    const fileContents = this.readFromDB()
    try {
      return fileContents.slice(-50)
    } catch (error) {
      logger.error(error)
      return fileContents
    }
  }
}
