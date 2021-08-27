import { listenServer, createServer } from '@jsk-server/koa'
import { requestProxy, configure } from '@smoex-nodejs/middle'
// @ts-ignore
import cors from '@koa/cors'

const app = createServer([], {
    configure, 
    requestProxy, 
    cors: cors(),
})

listenServer(app)
