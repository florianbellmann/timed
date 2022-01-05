test('Time formatter should exist', () => {
  expect(timeFormatter).toBeDefined()

  expect(timeFormatter.numberToTime).toBeDefined()
  expect(timeFormatter.timeToNumber).toBeDefined()

  expect(timeFormatter.numberToDaytime).toBeDefined()
  expect(timeFormatter.daytimeToNumber).toBeDefined()
})

test('Should convert number to time', () => {
  expect(timeFormatter.numberToTime(0)).toBe('00:00')
  expect(timeFormatter.numberToTime(1)).toBe('00:01')
  expect(timeFormatter.numberToTime(59)).toBe('00:59')
  expect(timeFormatter.numberToTime(60)).toBe('01:00')
  expect(timeFormatter.numberToTime(61)).toBe('01:01')
  expect(timeFormatter.numberToTime(3599)).toBe('59:59')
  expect(timeFormatter.numberToTime(3600)).toBe('01:00:00')
})

test('Should convert time to number', () => {
  expect(timeFormatter.timeToNumber('00:00')).toBe(0)
  expect(timeFormatter.timeToNumber('00:01')).toBe(1)
  expect(timeFormatter.timeToNumber('00:59')).toBe(59)
  expect(timeFormatter.timeToNumber('01:00')).toBe(60)
  expect(timeFormatter.timeToNumber('01:01')).toBe(61)
  expect(timeFormatter.timeToNumber('59:59')).toBe(3599)
  expect(timeFormatter.timeToNumber('01:00:00')).toBe(3600)
})

test("Should convert number to daytime", () => {
  expect(timeFormatter.daytimeToNumber(1300)).toBe("13:00")
  expect(timeFormatter.daytimeToNumber(1301)).toBe("13:01")
  expect(timeFormatter.daytimeToNumber(2013)).toBe("20:13")
  expect(timeFormatter.daytimeToNumber(638)).toBe("06:38")
}

test("Should convert daytime to number", () => {
  expect(timeFormatter.numberToDaytime("13:00")).toBe(1300)
  expect(timeFormatter.numberToDaytime("13:01")).toBe(1301)
  expect(timeFormatter.numberToDaytime("20:13")).toBe(2013)
  expect(timeFormatter.numberToDaytime("06:38")).toBe(638)
})
