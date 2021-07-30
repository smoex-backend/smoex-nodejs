import { listenServer, createAPIServer } from '@jsk-server/koa'
import { requestProxy, configure } from './middlewares'
import { fcClients } from '@jsk-aliyun/env'
import Router from 'koa-router'

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
const app = createAPIServer([router], {
    configure,
    request: requestProxy,
})

listenServer(app)