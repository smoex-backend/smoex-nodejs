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
    const matcher = createProxyMatcher(ctx)
    const httpProxy = matcher('http://')
    const fcProxy = matcher('fc://')
    if (httpProxy) {
        const httpMiddleware = k2c(createProxyMiddleware(httpProxy))
        await httpMiddleware(ctx, next)
    }
    if (fcProxy) {
        ctx.body = await fcRequestProxy(fcProxy) 
    }
    await next()
}