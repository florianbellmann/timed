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

test('BusinessLayer should exist and implement methods', () => {
  expect(SUT).toBeDefined()

  expect(SUT.getEntries).toBeDefined()
  expect(SUT.insertNewEntryFromInput).toBeDefined()
  expect(SUT.insertNewEntryFromTime).toBeDefined()
})

// TODO: implement
// test('Should insert new entry from input', () => {
//   resetTestDB()

//   const oldLength = SUT.getEntries().length
//   const testEntry = generateTestEntries(1)[0]

//   SUT.insertNewEntryFromInput(testEntry)

//   const entries = SUT.getEntries()
//   const newLength = entries.length
//   expect(entries.length).toBe(oldLength + 1)
//   expect(entries).toContainEqual(testEntry)
// })

test('Should insert entry from time', () => {
  resetTestDB()

  SUT.insertNewEntryFromTime(120)

  const entries = SUT.getEntries()

  expect(entries[entries.length - 1].workedTime).toBe(120)
  expect(entries[entries.length - 1].entryTime).toBe(120)
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

// TODO: different input types

// TODO: Also test wrong order of entries added. EG: you add an end entry and realize you forgot your start one
//
// TODO: rename business layer to application service?
// TODO: rename app to domain service

afterEach(() => {
  resetTestDB()
})
