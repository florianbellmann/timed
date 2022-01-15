import { Container } from 'inversify'
import 'reflect-metadata'
import { App } from '../app'
import { Cli } from '../cli/cli'
import { FileDBService } from '../db/file.db.service'
import { BusinessLayer } from '../business.layer/business.layer'
import { TYPES } from './types'
import { EntryManager } from '../entry.manager/entry.manager'

const container = new Container()

container.bind(TYPES.IDBService).to(FileDBService).inSingletonScope()
container.bind(TYPES.IEntryManager).to(EntryManager).inSingletonScope()
container.bind(TYPES.IApp).to(App).inSingletonScope()
container.bind(TYPES.ICli).to(Cli).inSingletonScope()
container.bind(TYPES.IBusinessLayer).to(BusinessLayer).inSingletonScope()

export { container }
