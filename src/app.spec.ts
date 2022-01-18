import { IApp } from './app'
import { container } from './dependency-injection/container'
import { TYPES } from './dependency-injection/types'

const SUT = container.get<IApp>(TYPES.IApp)

test('App should exist', () => {
  expect(SUT.displayLastEntries).toBeDefined()
  expect(SUT.main).toBeDefined()
  expect(SUT.performAction).toBeDefined()
  expect(SUT.quit).toBeDefined()
  expect(SUT.reloadLastEntries).toBeDefined()
  expect(SUT.waitForUserAction).toBeDefined()
})

// TODO: run different app scenarios and check for function times called
