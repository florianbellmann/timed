  insertNewEntryFromInput(entry: IEntry): void
  insertNewEntryFromTime(time: number): void
  getEntries(count?: number): IEntry[]
// import { container } from '../dependency-injection/container'
// import { TYPES } from '../dependency-injection/types'
// import { IBusinessLayer } from './entry.parser'

// const SUT = container.get<IBusinessLayer>(TYPES.IBusinessLayer)
// test('Entry parser should exist', () => {
//   expect(SUT).toBeDefined()

//   expect(SUT.newDBEntryFromInput).toBeDefined()
//   expect(SUT.parseDBEntry).toBeDefined()
// })

// test('Should parse a db entry', () => {
//   const testEntry = 'TEST ENTRY'

//   const parsed = SUT.parseDBEntry(testEntry)

//   expect(parsed.id).toBe(1)
//   expect(parsed.end).toBe('dfhsjk')
//   expect(parsed.start).toBe('dfhsjk')
//   expect(parsed.overHours).toBe('dfhsjk')
//   expect(parsed.date).toBe('dfhsjk')
//   expect(parsed.workTime).toBe('dfhsjk')
// })

// test('Should create new db entry string from input', () => {
//   // TODO: different input types

//   expect(SUT.newDBEntryFromInput({})).toBe('1,dfhsjk,dfhsjk,dfhsjk,dfhsjk,dfhsjk')
// })
