import { listenServer, createServer } from '@jsk-server/koa'
import { configure, requestProxy } from '@smoex-nodejs/middle'
import routers from './routers'

const app = createServer(routers, { 
    configure, 
    requestProxy, 
})

listenServer(app)