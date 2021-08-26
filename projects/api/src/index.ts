import { listenServer, createServer } from '@jsk-server/koa'
import { requestProxy, configure } from './middlewares'
import { fcClients } from '@jsk-aliyun/env'
import Router from 'koa-router'
// @ts-ignore
import cors from '@koa/cors'

const router = new Router({ prefix: '/test'})
router.get('/*', async ctx => {
    const fcData = fcClients['data']
    console.log(ctx.headers)
    const resp = await fcData.request(ctx.method, '/data/users/latest?uid=1&name=test-name', {
        // headers: ctx.header
    })
    console.log(resp)
    ctx.body = resp.data
})
const routers = [router]
const app = createServer(routers, {
    middlewares: { configure, requestProxy }
})
// @ts-ignore
app.use(cors())
listenServer(app)
