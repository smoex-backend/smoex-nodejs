import { revertRequestUrl, createProxyMatcher, fcRequestProxy } from '@jsk-aliyun/env'
// @ts-ignore
import k2c from 'koa2-connect'
import { createProxyMiddleware } from 'http-proxy-middleware'
import Koa from 'koa'
import { decodeToken } from './utils/jwt'
import { redisClients } from '@jsk-aliyun/env'


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
        headers: asRequestHeader(ctx.headers)
    })
    const httpProxy = matcher('http://')
    
    if (httpProxy) {
        const httpMiddleware = k2c(createProxyMiddleware(httpProxy))
        await httpMiddleware(ctx, next)
        return
    }

    const fcProxy = matcher('fc://')
    if (fcProxy) {
        const resp = await fcRequestProxy(fcProxy)
        console.log(resp)
        ctx.body = resp.data
        setResponseHeaders(ctx, resp.headers)
        return
    }
    await next()
}

function asRequestHeader(headers: any) {
    const newHeaders = {} as any
    if (headers['cookie']) {
        newHeaders['Cookie'] = headers['cookie']
    }
    return newHeaders
}

function setResponseHeaders(ctx: Koa.Context, headers: any) {
    for (const key of Object.keys(headers)) {
        const val = headers[key]
        const transkey = key.replace(/^.{1}|-.{1}/g, x => x.toUpperCase())
        ctx.set(transkey, val)
    }
    ctx.set('Content-Disposition', 'inline')
}

export async function internalAuth(ctx: Koa.Context, next: Koa.Next) {
    if (false) {
        throw new Error('only allow internal auth')
    }
    return await next()
}

export async function loginSessionAuth(ctx: Koa.Context, next: Koa.Next) {
    return await guestAuth(ctx, async () => {
        const redis = redisClients['auth']
        // @ts-ignore
        const { token } = ctx.auth
        const accessKey = `[access:login]${token.uuid}`
        const session = await redis.getJSON(accessKey)
        if (token.user && !session) {
            throw new Error('登录已失效')
        }
        if (!session) {
            throw new Error('鉴权登录失败')
        }
        ctx.auth.session = session
        ctx.auth.sessionKey = accessKey
        return await next()
    })
}

export async function guestAuth(ctx: Koa.Context, next: Koa.Next) {
    const token = ctx.cookies.get('token')
    // 1. 判断 token 是否存在
    if (!token) {
        throw new Error('Uncheck token in cookie')
    }
    // 2. 判断 token 是否失效
    ctx.auth = ctx.auth || {}
    ctx.auth.token = decodeToken(token)
    // 3. 判断 token uuid 是否存在
    if (!ctx.auth.token.uuid) {
        throw new Error('Uncheck uuid in token')
    }
    return await next()
}

export async function memberAuth(ctx: Koa.Context, next: Koa.Next) {
    await guestAuth(ctx, next)
    return await next()
}