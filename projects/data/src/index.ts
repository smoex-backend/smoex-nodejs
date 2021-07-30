import { listenServer, createAPIServer } from '@jsk-server/koa'
import commonRouter from './routers/common'
import usersRouter from './routers/users'
import { configure, requestProxy } from './middlewares'

const routers = [
    commonRouter,
    usersRouter,
]

const app = createAPIServer(routers, {
    configure,
    request: requestProxy,
})

listenServer(app)