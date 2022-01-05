import { Container } from 'inversify'
import 'reflect-metadata'
import { App } from '../app'
import { FileDBService } from '../db/file.db.service'
import { TYPES } from './types'

const container = new Container()

container.bind(TYPES.IDBService).to(FileDBService).inSingletonScope()
container.bind(TYPES.IApp).to(App).inSingletonScope()

export { container }
