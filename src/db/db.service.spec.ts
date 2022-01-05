import { container } from '../dependency-injection/container'
import * as path from 'path'
import * as fs from 'fs'
import { TYPES } from '../dependency-injection/types'
import { IDBService } from './db.service'

const SUT = container.get<IDBService>(TYPES.IDBService)
const testDB = path.resolve(process.cwd(), 'test.csv')
SUT.setDBPath(testDB)

function resetTestDB() {
  try {
    fs.unlinkSync(testDB)
  } catch (error) {
    // logger.error(error)
  }
}

test('DBService should exist and implement methods', () => {
  expect(SUT).toBeDefined()
  expect(SUT.readFromDB).toBeDefined()
  expect(SUT.appendEntry).toBeDefined()
  expect(SUT.readLast50Entries).toBeDefined()
  expect(SUT.setDBPath).toBeDefined()
})

test("Should create db if it doesn't exist", () => {
  resetTestDB()
  const testEntry = 'TEST ENTRY'

  SUT.appendEntry(testEntry)

  expect(fs.existsSync(testDB)).toBeTruthy()
  expect(SUT.readFromDB().length).toBe(1)
  expect(SUT.readFromDB()[0]).toBe(testEntry)
})

// afterEach(() => {
//   resetTestDB()
// })
test('Should append entry to db', () => {
  const testEntry = 'TEST ENTRY'
  const oldLength = SUT.readFromDB().length

  SUT.appendEntry(testEntry)

  expect(SUT.readFromDB().length).toBe(oldLength + 1)
  expect(SUT.readFromDB()[oldLength]).toBe(testEntry)
})

test('Should read last 50 entries from db', () => {
  resetTestDB()
  for (let i = 0; i < 100; i++) {
    SUT.appendEntry(`TEST ENTRY ${i}`)
  }

  const last50 = SUT.readLast50Entries()

  expect(last50.length).toBe(50)
  expect(last50[0]).toBe('TEST ENTRY 50')
  expect(last50[49]).toBe('TEST ENTRY 99')
})

test('Should read less than 50 entries from db', () => {
  resetTestDB()
  for (let i = 0; i < 30; i++) {
    SUT.appendEntry(`TEST ENTRY ${i}`)
  }

  const last50 = SUT.readLast50Entries()

  expect(last50.length).toBe(30)
  expect(last50.length).toBeLessThan(50)
})
