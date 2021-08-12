import { listenServer, createServer } from '@jsk-server/koa'
import routers from './routers'
import { configure, requestProxy } from './middlewares'

const app = createServer(routers, {
    middlewares: { configure, requestProxy },
})

listenServer(app)