import * as path from 'path'
import * as fs from 'fs'
import { container } from '../dependency-injection/container'
import { TYPES } from '../dependency-injection/types'
import { IBusinessLayer } from './business.layer'
import { IDBService } from '../db/db.service'
import { randomUUID } from 'crypto'
import { EntryType, IEntry } from '../entry.manager/entry'
import { IEntryManager } from '../entry.manager/entry.manager'

const SUT = container.get<IBusinessLayer>(TYPES.IBusinessLayer)
const testDB = path.resolve(process.cwd(), 'test.csv')
const dbService = container.get<IDBService>(TYPES.IDBService)
const entryManager = container.get<IEntryManager>(TYPES.IEntryManager)
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

    const overTime = 0

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

function prepRandomDB() {
  resetTestDB()
  const testEntries = generateTestEntries(9)

  // write test entries to db
  testEntries.forEach((entry) => {
    entryManager.appendEntry(entry)
  })
}

test('BusinessLayer should exist and implement methods', () => {
  expect(SUT).toBeDefined()

  expect(SUT.getEntries).toBeDefined()
  expect(SUT.insertNewEntryFromInput).toBeDefined()
  expect(SUT.insertNewEntryFromTime).toBeDefined()
})

test('Should insert start entry from input', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const generatedEntry = generateTestEntries(1)[0]
  const testStartEntry: IEntry = {
    id: generatedEntry.id,
    date: generatedEntry.date,
    entryTime: generatedEntry.entryTime,
    entryType: 'start'
  }

  // act
  SUT.insertNewEntryFromInput(testStartEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testStartEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.overTime).toBe(lastEntry.overTime)
  expect(entryInDb.workedTime).toBe(0)
  expect(entries.length).toBe(oldLength + 1)
})

test('Should insert overtime entry from input', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const generatedEntry = generateTestEntries(1)[0]
  const testOvertimeEntry: IEntry = {
    id: generatedEntry.id,
    date: generatedEntry.date,
    entryTime: generatedEntry.entryTime,
    entryType: 'overtime'
  }

  // act
  SUT.insertNewEntryFromInput(testOvertimeEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testOvertimeEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.workedTime).toBe(0)
  expect(entryInDb.entryTime).toBe(testOvertimeEntry.entryTime)
  expect(entryInDb.overTime).toBe(testOvertimeEntry.entryTime + lastEntry.overTime)
  expect(entries.length).toBe(oldLength + 1)
})

test('Should insert end entry from input', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const generatedEntry1 = generateTestEntries(1)[0]
  const testStartEntry: IEntry = {
    id: generatedEntry1.id,
    date: generatedEntry1.date,
    entryTime: 700,
    entryType: 'start'
  }
  const generatedEntry = generateTestEntries(1)[0]
  const testEndEntry: IEntry = {
    id: generatedEntry.id,
    date: generatedEntry.date,
    entryTime: 1330,
    entryType: 'end'
  }
  const randomEntry = generateTestEntries(1)[0]
  randomEntry.entryType = 'overtime'

  // act
  SUT.insertNewEntryFromInput(testStartEntry)
  entryManager.appendEntry(randomEntry)
  SUT.insertNewEntryFromInput(testEndEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testEndEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.overTime).toBe(lastEntry.overTime)
  expect(entryInDb.workedTime).toBe(390)
  expect(entries.length).toBe(oldLength + 3)
})

test('Should insert start entry from input for past day', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const pastDate = new Date(Date.now())
  pastDate.setDate(pastDate.getDate() - 2)
  pastDate.setTime(pastDate.getTime() - pastDate.getTimezoneOffset() * 60 * 1000)
  pastDate.setMilliseconds(0)
  pastDate.setMilliseconds(0)
  pastDate.setSeconds(0)
  pastDate.setMinutes(0, 0, 0)

  const generatedEntry = generateTestEntries(1)[0]
  const testStartEntry: IEntry = {
    id: generatedEntry.id,
    date: pastDate,
    entryTime: generatedEntry.entryTime,
    entryType: 'start'
  }

  // act
  SUT.insertNewEntryFromInput(testStartEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testStartEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.overTime).toBe(lastEntry.overTime)
  expect(entryInDb.workedTime).toBe(0)
  expect(entries.length).toBe(oldLength + 1)
})

test('Should insert end entry from input for past day', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const pastDate = new Date(Date.now())
  pastDate.setDate(pastDate.getDate() - 2)
  pastDate.setTime(pastDate.getTime() - pastDate.getTimezoneOffset() * 60 * 1000)
  pastDate.setMilliseconds(0)
  pastDate.setMilliseconds(0)
  pastDate.setSeconds(0)
  pastDate.setMinutes(0, 0, 0)

  const generatedEntry1 = generateTestEntries(1)[0]
  const testStartEntry: IEntry = {
    id: generatedEntry1.id,
    date: pastDate,
    entryTime: 745,
    entryType: 'start'
  }
  const generatedEntry = generateTestEntries(1)[0]
  const testEndEntry: IEntry = {
    id: generatedEntry.id,
    date: pastDate,
    entryTime: 1205,
    entryType: 'end'
  }
  const randomEntry = generateTestEntries(1)[0]
  randomEntry.entryType = 'overtime'

  // act
  SUT.insertNewEntryFromInput(testStartEntry)
  entryManager.appendEntry(randomEntry)
  SUT.insertNewEntryFromInput(testEndEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testEndEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.overTime).toBe(lastEntry.overTime)
  expect(entryInDb.workedTime).toBe(260)
  expect(entries.length).toBe(oldLength + 3)
})

test('Should insert end entry from input for past day without past start entry', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const pastDate = new Date(Date.now())
  pastDate.setDate(pastDate.getDate() - 2)
  pastDate.setTime(pastDate.getTime() - pastDate.getTimezoneOffset() * 60 * 1000)
  pastDate.setMilliseconds(0)
  pastDate.setMilliseconds(0)
  pastDate.setSeconds(0)
  pastDate.setMinutes(0, 0, 0)

  const generatedEntry = generateTestEntries(1)[0]
  const testEndEntry: IEntry = {
    id: generatedEntry.id,
    date: pastDate,
    entryTime: 1205,
    entryType: 'end'
  }

  // act
  SUT.insertNewEntryFromInput(testEndEntry)

  // assert
  const entries = SUT.getEntries()
  const entryInDb = entries.find((entry) => entry.id === testEndEntry.id)
  expect(entryInDb).toBeDefined()
  expect(entryInDb.overTime).toBe(lastEntry.overTime)
  expect(entryInDb.workedTime).toBe(0)
  expect(entries.length).toBe(oldLength + 1)
})

test('Should insert second end entry from input', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const generatedEntry1 = generateTestEntries(1)[0]
  const testStartEntry1: IEntry = {
    id: generatedEntry1.id,
    date: generatedEntry1.date,
    entryTime: 1020,
    entryType: 'start'
  }
  const generatedEntry2 = generateTestEntries(1)[0]
  const testEndEntry1: IEntry = {
    id: generatedEntry2.id,
    date: generatedEntry2.date,
    entryTime: 1305,
    entryType: 'end'
  }
  const generatedEntry3 = generateTestEntries(1)[0]
  const testStartEntry2: IEntry = {
    id: generatedEntry3.id,
    date: generatedEntry3.date,
    entryTime: 1315,
    entryType: 'start'
  }
  const generatedEntry4 = generateTestEntries(1)[0]
  const testEndEntry2: IEntry = {
    id: generatedEntry4.id,
    date: generatedEntry4.date,
    entryTime: 1630,
    entryType: 'end'
  }
  const randomEntry = generateTestEntries(1)[0]
  randomEntry.entryType = 'overtime'

  // act
  SUT.insertNewEntryFromInput(testStartEntry1)
  SUT.insertNewEntryFromInput(testEndEntry1)
  SUT.insertNewEntryFromInput(testStartEntry2)
  entryManager.appendEntry(randomEntry)
  SUT.insertNewEntryFromInput(testEndEntry2)

  // assert
  const entries = SUT.getEntries()
  const startEntryInDb1 = entries.find((entry) => entry.id === testStartEntry1.id)
  const startEntryInDb2 = entries.find((entry) => entry.id === testStartEntry2.id)
  const endEntryInDb1 = entries.find((entry) => entry.id === testEndEntry1.id)
  const endEntryInDb2 = entries.find((entry) => entry.id === testEndEntry2.id)
  expect(startEntryInDb1).toBeDefined()
  expect(startEntryInDb2).toBeDefined()
  expect(endEntryInDb1).toBeDefined()
  expect(endEntryInDb2).toBeDefined()

  expect(startEntryInDb1.overTime).toBe(lastEntry.overTime)
  expect(startEntryInDb2.overTime).toBe(lastEntry.overTime)
  expect(endEntryInDb1.overTime).toBe(lastEntry.overTime)
  expect(endEntryInDb2.overTime).toBe(lastEntry.overTime)

  expect(startEntryInDb1.workedTime).toBe(0)
  expect(endEntryInDb1.workedTime).toBe(165)
  expect(startEntryInDb2.workedTime).toBe(0)
  expect(endEntryInDb2.workedTime).toBe(195)

  expect(entries.length).toBe(oldLength + 5)
})

test('Should insert second end entry from past day', () => {
  //arrange
  prepRandomDB()
  const oldLength = SUT.getEntries().length
  const lastEntry = SUT.getEntries()[SUT.getEntries().length - 1]

  const pastDate = new Date(Date.now())
  pastDate.setDate(pastDate.getDate() - 2)
  pastDate.setTime(pastDate.getTime() - pastDate.getTimezoneOffset() * 60 * 1000)
  pastDate.setMilliseconds(0)
  pastDate.setMilliseconds(0)
  pastDate.setSeconds(0)
  pastDate.setMinutes(0, 0, 0)

  const generatedEntry1 = generateTestEntries(1)[0]
  const testStartEntry1: IEntry = {
    id: generatedEntry1.id,
    date: pastDate,
    entryTime: 750,
    entryType: 'start'
  }
  const generatedEntry2 = generateTestEntries(1)[0]
  const testEndEntry1: IEntry = {
    id: generatedEntry2.id,
    date: pastDate,
    entryTime: 1215,
    entryType: 'end'
  }
  const generatedEntry3 = generateTestEntries(1)[0]
  const testStartEntry2: IEntry = {
    id: generatedEntry3.id,
    date: pastDate,
    entryTime: 1315,
    entryType: 'start'
  }
  const generatedEntry4 = generateTestEntries(1)[0]
  const testEndEntry2: IEntry = {
    id: generatedEntry4.id,
    date: pastDate,
    entryTime: 1840,
    entryType: 'end'
  }
  const randomEntry = generateTestEntries(1)[0]
  randomEntry.entryType = 'overtime'

  // act
  SUT.insertNewEntryFromInput(testStartEntry1)
  SUT.insertNewEntryFromInput(testEndEntry1)
  SUT.insertNewEntryFromInput(testStartEntry2)
  entryManager.appendEntry(randomEntry)
  SUT.insertNewEntryFromInput(testEndEntry2)

  // assert
  const entries = SUT.getEntries()
  const startEntryInDb1 = entries.find((entry) => entry.id === testStartEntry1.id)
  const startEntryInDb2 = entries.find((entry) => entry.id === testStartEntry2.id)
  const endEntryInDb1 = entries.find((entry) => entry.id === testEndEntry1.id)
  const endEntryInDb2 = entries.find((entry) => entry.id === testEndEntry2.id)
  expect(startEntryInDb1).toBeDefined()
  expect(startEntryInDb2).toBeDefined()
  expect(endEntryInDb1).toBeDefined()
  expect(endEntryInDb2).toBeDefined()

  expect(startEntryInDb1.overTime).toBe(lastEntry.overTime)
  expect(startEntryInDb2.overTime).toBe(lastEntry.overTime)
  expect(endEntryInDb1.overTime).toBe(lastEntry.overTime)
  expect(endEntryInDb2.overTime).toBe(lastEntry.overTime)

  expect(startEntryInDb1.workedTime).toBe(0)
  expect(endEntryInDb1.workedTime).toBe(265)
  expect(startEntryInDb2.workedTime).toBe(0)
  expect(endEntryInDb2.workedTime).toBe(325)

  expect(entries.length).toBe(oldLength + 5)
})

test('Should insert entry from time', () => {
  prepRandomDB()

  SUT.insertNewEntryFromTime(120)

  const entries = SUT.getEntries()

  expect(entries[entries.length - 1].workedTime).toBe(120)
  expect(entries[entries.length - 1].entryTime).toBe(-1)
  expect(entries[entries.length - 1].entryType).toBe('overtime')
})

test('Should return all entries', () => {
  resetTestDB()

  resetTestDB()
  // generate test entries
  const testEntries = generateTestEntries(9)

  // write test entries to db
  testEntries.forEach((entry) => {
    entryManager.appendEntry(entry)
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

// TODO: rename business layer to application service?
// TODO: rename app to domain service

afterEach(() => {
  resetTestDB()
})
