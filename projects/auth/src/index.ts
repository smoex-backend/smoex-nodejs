import { listenServer, createServer } from '@jsk-server/koa'
import routers from './routers'
import { configure } from './middlewares'

const app = createServer(routers, {
    middlewares: { configure },
})

app.proxy = true

listenServer(app)