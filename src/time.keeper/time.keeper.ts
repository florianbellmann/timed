import { injectable } from 'inversify'

export interface ITimeKeeper {
  a: string
}
@injectable()
export class TimeKeeper implements ITimeKeeper {
  a: string
}
