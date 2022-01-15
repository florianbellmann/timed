import { container } from '../dependency-injection/container'
import { TYPES } from '../dependency-injection/types'
import { ICli } from './cli'

const SUT = container.get<ICli>(TYPES.ICli)

// cant test much here because of UI specific stuff
test('CLI should exist and implement methods', () => {
  expect(SUT).toBeDefined()

  expect(SUT.displayLastEntries).toBeDefined()
  expect(SUT.displayAccumulatedOvertime).toBeDefined()
  expect(SUT.displayUnknownCommand).toBeDefined()

  expect(SUT.readCommand).toBeDefined()
  expect(SUT.readAppendTime).toBeDefined()
  expect(SUT.readSubtractTime).toBeDefined()
  expect(SUT.readNewEntry).toBeDefined()
})
