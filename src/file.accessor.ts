import * as path from 'path'
import * as fs from 'fs'

class FileAccessor {
  private readonly filePath = path.resolve(process.cwd(), 'timelog.csv')

  constructor() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '')
    }
  }

  readFileContents(): string {
    return fs.readFileSync(this.filePath, 'utf8')
  }

  appendEntry(entry: string): void {
    fs.appendFileSync(this.filePath, entry)
  }

  readLast50Entries(): string[] {
    const fileContents = this.readFileContents()
    return fileContents.split('\n').slice(-50)
  }
}

export const fileAccessor = new FileAccessor()
