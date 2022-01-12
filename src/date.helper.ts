export const isBefore = (dateA: Date, dateB: Date): boolean => dateA < dateB
export const isAfter = (dateA: Date, dateB: Date): boolean => dateA > dateB

export const getDaysBetween = (dateInitial: Date, dateFinal: Date): number => ((dateFinal as unknown as number) - (dateInitial as unknown as number)) / (1000 * 3600 * 24)

export const isSameDay = (dateA: Date, dateB: Date): boolean => {
  if (dateA.getFullYear() !== dateB.getFullYear()) return false
  if (dateA.getMonth() !== dateB.getMonth()) return false
  if (dateA.getDate() !== dateB.getDate()) return false
  return true
}

export const getDayBefore = (date: Date): Date => {
  const prevDate = new Date(date.getTime())
  prevDate.setDate(date.getDate() - 1)
  return prevDate
}

export const getDayAfter = (date: Date): Date => {
  const nextDate = new Date(date.getTime())
  nextDate.setDate(date.getDate() + 1)
  return nextDate
}

export const getSpecificDay = (differenceInDays: number, hours?: number, minutes?: number, month?: number) => {
  const specificDate = new Date()
  specificDate.setDate(specificDate.getDate() + differenceInDays)
  if (hours) specificDate.setHours(hours)
  if (minutes) specificDate.setMinutes(minutes)
  if (month) specificDate.setMonth(month)

  specificDate.setSeconds(0)
  specificDate.setMilliseconds(0)

  return specificDate
}

export const getWeekNumber = (date: Date) => {
  // Copy date so don't modify original
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  // Get first day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((date as unknown as number) - (yearStart as unknown as number)) / 86400000 + 1) / 7)
  // Return array of year and week number
  return [date.getUTCFullYear(), weekNo]
}

export const formatDateString = (date: string): string => {
  const dateObj = new Date(date)
  const day = dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()
  return `${day}.${month}.${year}`
}
