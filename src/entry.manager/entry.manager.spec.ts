import * as path from 'path'
import * as fs from 'fs'
import { randomUUID } from 'crypto'
import { container } from '../dependency-injection/container'
import { TYPES } from '../dependency-injection/types'
import { EntryType, IEntry } from './entry'
import { IEntryManager } from './entry.manager'
import { IDBService } from '../db/db.service'

const SUT = container.get<IEntryManager>(TYPES.IEntryManager)
const testDB = path.resolve(process.cwd(), 'test.csv')
const dbService = container.get<IDBService>(TYPES.IDBService)
dbService.setDBPath(testDB)

function resetTestDB() {
  try {
    fs.unlinkSync(testDB)
  } catch (error) {
    // suppress errors for test
    // logger.error(error)
  }
}

function generateTestEntries(count: number): IEntry[] {
  const testEntries: IEntry[] = []
  for (let i = 0; i < count; i++) {
    const id = randomUUID()
    const date = new Date(Date.now())
    date.setDate(date.getDate() - i)
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    date.setMilliseconds(0)
    date.setMilliseconds(0)
    date.setSeconds(0)
    date.setMinutes(0, 0, 0)

    const entryTime = Math.floor(Math.random() * 120)
    const possibleEntryTypes = ['start', 'end', 'overtime']
    const entryType: EntryType = possibleEntryTypes[Math.floor(Math.random() * 2)] as EntryType

    const overTime = Math.floor(Math.random() * 120)

    testEntries.push({
      id,
      date,
      entryTime,
      entryType,
      workedTime: entryTime,
      overTime
    })
  }
  return testEntries
}

test('CLI should exist and implement methods', () => {
  expect(SUT).toBeDefined()

  expect(SUT.appendEntry).toBeDefined()
  expect(SUT.calculateWorkForEndDate).toBeDefined()
  expect(SUT.getEntries).toBeDefined()
  expect(SUT.getEntriesByDate).toBeDefined()
  expect(SUT.getLastEntry).toBeDefined()
  expect(SUT.getLastOvertime).toBeDefined()
  expect(SUT.isFirstEntryOfToday).toBeDefined()
  expect(SUT.convertToHumanDate).toBeDefined()
  expect(SUT.parseOvertime).toBeDefined()
})

test('Should append entry to timelog', () => {
  resetTestDB()

  const testEntries = generateTestEntries(1)
  const oldLength = SUT.getEntries().length
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  // SUT.appendEntry(testEntry)

  const newEntries = SUT.getEntries()
  expect(newEntries.length).toBe(oldLength + 1)
  expect(newEntries[oldLength]).toStrictEqual(testEntries[0])
})

test('Should read entries from db', () => {
  resetTestDB()
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
  expect(entries[0]).toStrictEqual(testEntries[testEntries.length - 1])
  expect(entries[1]).toStrictEqual(testEntries[testEntries.length - 2])
  expect(entries[2]).toStrictEqual(testEntries[testEntries.length - 3])
  expect(entries[3]).toStrictEqual(testEntries[testEntries.length - 4])
  expect(entries[4]).toStrictEqual(testEntries[testEntries.length - 5])
  expect(entries[5]).toStrictEqual(testEntries[testEntries.length - 6])
  expect(entries[6]).toStrictEqual(testEntries[testEntries.length - 7])
  expect(entries[7]).toStrictEqual(testEntries[testEntries.length - 8])
  expect(entries[8]).toStrictEqual(testEntries[0])
})

test('Should read entries from db if none are present', () => {
  resetTestDB()
  // read entries from db
  const entries = SUT.getEntries()

  // check if entries are correct
  expect(entries.length).toBe(0)
  expect(entries[0]).toBe(undefined)
})

test('Should return last entry', () => {
  resetTestDB()

  const testEntry = generateTestEntries(1)[0]

  SUT.appendEntry(testEntry)

  expect(SUT.getLastEntry()).toStrictEqual(testEntry)
})

test('Should return entries by date', () => {
  resetTestDB()

  function getDateToday() {
    const date = new Date(Date.now())
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
    return date
  }

  const testEntries = [
    {
      id: randomUUID(),
      date: getDateToday(),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start' as EntryType,
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start' as EntryType,
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: getDateToday(),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start' as EntryType,
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start' as EntryType,
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    }
  ]
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  const entriesByDate = SUT.getEntriesByDate(new Date(Date.now()))

  expect(entriesByDate.length).toBe(2)
  expect(entriesByDate).toContainEqual(testEntries[0])
  expect(entriesByDate).toContainEqual(testEntries[2])
  // expect('').con
})

test('Should return false for first entry of today', () => {
  resetTestDB()

  function getDateToday() {
    const date = new Date(Date.now())
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
    return date
  }

  const testEntries: IEntry[] = [
    {
      id: randomUUID(),
      date: getDateToday(),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    }
  ]
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  const firstEntryOfToday = SUT.isFirstEntryOfToday()
  expect(firstEntryOfToday).toBe(false)
})

test('Should return true for first entry of today', () => {
  resetTestDB()

  const testEntries: IEntry[] = [
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    },
    {
      id: randomUUID(),
      date: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      entryTime: Math.floor(Math.random() * 120),
      entryType: 'start',
      overTime: Math.floor(Math.random() * 120),
      workedTime: Math.floor(Math.random() * 120)
    }
  ]
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  const firstEntryOfToday = SUT.isFirstEntryOfToday()
  expect(firstEntryOfToday).toBe(true)
})

test('Should parse overtime to human display', () => {
  const time = 100
  const humanTime = SUT.parseOvertime(time)

  expect(humanTime).toBe('1h 40m')
})
test('Should parse overtime to human display', () => {
  const time = 200
  const humanTime = SUT.parseOvertime(time)

  expect(humanTime).toBe('3h 20m')
})
test('Should parse overtime to human display', () => {
  const time = 567
  const humanTime = SUT.parseOvertime(time)

  expect(humanTime).toBe('9h 27m')
})

test('Should return last overtime', () => {
  const testEntries = generateTestEntries(9)
  testEntries.forEach((entry) => {
    SUT.appendEntry(entry)
  })

  const lastOvertime = SUT.getLastOvertime()

  expect(lastOvertime).toBe(testEntries[8].overTime)
})

test('Should calculate work for end date', () => {
  // TODO: this tests needs to be implemented still
})

// expect(SUT.convertToHumanDate).toBeDefined() // not used anymore?

afterEach(() => {
  resetTestDB()
})
