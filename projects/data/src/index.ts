import { listenServer, createAPIServer } from '@jsk-server/koa'
import { configure, requestProxy } from './middlewares'
import routers from './routers'

const app = createAPIServer(routers, {
    configure,
})

listenServer(app)