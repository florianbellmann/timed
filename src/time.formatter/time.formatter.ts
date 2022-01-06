import { injectable } from 'inversify'

type idType = `${number}-${number}-${number}-${number}`

export interface ITimeFormatter {
  a: string
}

@injectable()
export class TimeFormatter implements ITimeFormatter {
  a: string
}
