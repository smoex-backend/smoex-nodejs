import { Context, Next } from 'koa';
import { envConfig, urlProxies, FCServiceProxy } from '../modules/aliyun';

const k2c = require('koa2-connect');
const send = require('koa-send')
const proxyMiddle = require('http-proxy-middleware');
const { aliyun } = envConfig

export function requestProxy() {
    return async function (ctx: any, next: any) {
        const { path } = ctx;
        const { httpProxy, apiProxy: serviceProxy } = urlProxies

        for (const route of Object.keys(httpProxy)) {
            if (path.match(route)) {
                await k2c(proxyMiddle(urlProxies.httpProxy[route]))(ctx, next)
                return
            }
        }

        for (const name of Object.keys(serviceProxy)) {
            const p = serviceProxy[name]
            if (path.startsWith(p.from)) {
                await FCServiceProxy(ctx, name)
                return
            }
        }
        await next();
    }
}


export function staticProxy() {
    return async function(ctx: Context, next: Next) {
        const { res: stati } = aliyun
        const mpath = ctx.path

        if (!stati
            || (!stati.local && mpath.startsWith('/dev')
            || ['/bff', '/api'].find(pre => mpath.startsWith(pre))
        )) {
            await next()
            return
        }

        let done = false
        const path = ctx.path.replace('/dev', '')
        const root = stati[ctx.config.device].path

        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
            try {
                done = await send(ctx, path, { root })
            } catch (err) {
                console.error(err)
                if (err.status !== 404) {
                    throw err
                }
            }
        }
    
        if (!done) {
            await next()
        }
    }
}