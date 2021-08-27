import { listenServer, createServer } from '@jsk-server/koa'
import { configure } from '@smoex-nodejs/middle';
import routers from "./routers";

const app = createServer(routers, {
    configure
})

listenServer(app)