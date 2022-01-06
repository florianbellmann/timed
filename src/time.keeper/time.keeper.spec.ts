// import { timeKeeper } from './time.keeper'

// test('Time keeper should exist', () => {
//   expect(timeKeeper).toBeDefined()

//   expect(timeKeeper.resetOvertime).toBeDefined()
//   expect(timeKeeper.getOvertime).toBeDefined()
//   expect(timeKeeper.addToOvertime).toBeDefined()
//   expect(timeKeeper.substractFromOvertime).toBeDefined()
// })

// test('Should reset overtime to 0', () => {
//   timeKeeper.resetOvertime()

//   expect(timeKeeper.getOvertime()).toBe(0)
// })

// test('Should add to overtime and return accumulated overtime', () => {
//   timeKeeper.resetOvertime()
//   timeKeeper.addToOvertime(10)
//   timeKeeper.addToOvertime(20)

//   expect(timeKeeper.getOvertime()).toBe(30)
// })

// test('Should substract from overtime and return accumulated overtime', () => {
//   timeKeeper.resetOvertime()
//   timeKeeper.addToOvertime(100)
//   timeKeeper.substractFromOvertime(10)

//   expect(timeKeeper.getOvertime()).toBe(90)
// })
