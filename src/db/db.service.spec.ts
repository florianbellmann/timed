import { container } from '../dependency-injection/container'
import * as path from 'path'
import * as fs from 'fs'
import { TYPES } from '../dependency-injection/types'
import { IDBService } from './db.service'
import { randomUUID } from 'crypto'
import { EntryType } from '../entry.manager/entry'

const SUT = container.get<IDBService>(TYPES.IDBService)
const testDB = path.resolve(process.cwd(), 'test.csv')
SUT.setDBPath(testDB)

function resetTestDB() {
  try {
    fs.unlinkSync(testDB)
  } catch (error) {
    // suppress errors for test
    // console.error(error)
  }
}

function generateTestEntries(count: number): string[] {
  const testEntries: string[] = []
  for (let i = 0; i < count; i++) {
    const id = randomUUID()
    const date = new Date(Date.now())
    date.setDate(date.getDate() - i)
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000)

    const entryTime = Math.floor(Math.random() * 120)
    const possibleEntryTypes = ['start', 'end', 'overtime']
    const entryType: EntryType = possibleEntryTypes[Math.floor(Math.random() * 2)] as EntryType

    const overTime = Math.floor(Math.random() * 120)

    testEntries.push(`${id};${date.toUTCString()};${entryTime};${entryTime},${entryType};${overTime};`)
  }
  return testEntries
}

test('DBService should exist and implement methods', () => {
  expect(SUT).toBeDefined()

  expect(SUT.appendEntry).toBeDefined()
  expect(SUT.getEntries).toBeDefined()
  expect(SUT.getLastEntry).toBeDefined()
  expect(SUT.setDBPath).toBeDefined()
})

test("Should create db if it doesn't exist", () => {
  resetTestDB()
  const testEntry = 'TEST ENTRY'

  SUT.appendEntry(testEntry)

  expect(fs.existsSync(testDB)).toBeTruthy()
  expect(SUT.getEntries().length).toBe(1)
  expect(SUT.getEntries()[0]).toBe(testEntry)
})

test('Should read entries from db', () => {
  // generate test entries
  const testEntries = generateTestEntries(9)

  // write test entries to db
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  // read entries from db
  const entries = SUT.getEntries()

  // check if entries are correct
  expect(entries.length).toBe(testEntries.length)
  expect(entries[0]).toBe(testEntries[0])
  expect(entries[1]).toBe(testEntries[1])
  expect(entries[2]).toBe(testEntries[2])
  expect(entries[3]).toBe(testEntries[3])
  expect(entries[4]).toBe(testEntries[4])
  expect(entries[5]).toBe(testEntries[5])
  expect(entries[6]).toBe(testEntries[6])
})

test('Should read entries from db if none are present', () => {
  // read entries from db
  const entries = SUT.getEntries()

  // check if entries are correct
  expect(entries.length).toBe(0)
  expect(entries[0]).toBe(undefined)
})

test('Should append entry to db', () => {
  const testEntry = '76e29ed2-2877-40de-8b4f-4d12ede131e1;Wed, 12 Jan 2022 12:00:00 GMT;1200;3;end;0;'
  const oldLength = SUT.getEntries().length

  SUT.appendEntry(testEntry)

  expect(SUT.getEntries().length).toBe(oldLength + 1)
  expect(SUT.getEntries()[oldLength]).toBe(testEntry)
})

test('Should return last entry', () => {
  const testEntry = '76e29ed2-2877-40de-8b4f-4d12ede131e1;Wed, 12 Jan 2022 12:00:00 GMT;1200;3;end;0;'

  SUT.appendEntry(testEntry)

  expect(SUT.getLastEntry()).toBe(testEntry)
})

afterEach(() => {
  resetTestDB()
})
