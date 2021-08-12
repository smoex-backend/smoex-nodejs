import { listenServer, createServer } from '@jsk-server/koa'
import { configure } from './middlewares'
import routers from './routers'

const app = createServer(routers, {
    middlewares: { configure },
})

listenServer(app)