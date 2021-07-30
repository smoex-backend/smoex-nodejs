import { revertRequestUrl, createProxyMatcher, fcRequestProxy } from '@jsk-aliyun/env'
// @ts-ignore
import k2c from 'koa2-connect'
import { createProxyMiddleware } from 'http-proxy-middleware'
import Koa from 'koa'

export async function configure(ctx: Koa.Context, next: Koa.Next) {
    ctx.url = revertRequestUrl(ctx.url)
    await next();
}

export async function requestProxy(ctx: Koa.Context, next: Koa.Next) {
    const matcher = createProxyMatcher({
        url: ctx.url,
        method: ctx.method,
        // @ts-ignore
        body: ctx.request.body,
    })
    const httpProxy = matcher('http://')
    const fcProxy = matcher('fc://')
    if (httpProxy) {
        const httpMiddleware = k2c(createProxyMiddleware(httpProxy))
        await httpMiddleware(ctx, next)
        return
    }

    if (fcProxy) {
        const resp = await fcRequestProxy(fcProxy)
        ctx.body = resp.data
        for (const key of Object.keys(resp.headers)) {
            const val = resp.headers[key]
            const transkey = key.replace(/^.{1}|-.{1}/g, x => x.toUpperCase())
            ctx.set(transkey, val)
        }
        ctx.set('Content-Disposition', 'inline')
        return
    }
    await next()
}