import { Container } from 'inversify'
import 'reflect-metadata'
import { App } from '../app'
import { Cli } from '../cli/cli'
import { FileDBService } from '../db/file.db.service'
import { BusinessLayer } from '../business.layer/business.layer'
import { TimeFormatter } from '../time.formatter/time.formatter'
import { TimeKeeper } from '../time.keeper/time.keeper'
import { TYPES } from './types'

const container = new Container()

container.bind(TYPES.IDBService).to(FileDBService).inSingletonScope()
container.bind(TYPES.IApp).to(App).inSingletonScope()
container.bind(TYPES.ITimeFormatter).to(TimeFormatter).inSingletonScope()
container.bind(TYPES.ITimeKeeper).to(TimeKeeper).inSingletonScope()
container.bind(TYPES.ICli).to(Cli).inSingletonScope()
container.bind(TYPES.IBusinessLayer).to(BusinessLayer).inSingletonScope()

export { container }
