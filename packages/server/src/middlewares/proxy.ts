import { Context, Next } from 'koa';

const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const pathToRegexp = require('path-to-regexp');
const send = require('koa-send')

export function requestProxy(proxies: any = {}) {
    return async function (ctx: any, next: any) {
        const { path = '' } = ctx;
        for (const route of Object.keys(proxies)) {
            if (path.match(route)) {
                const toProxy = k2c(httpProxy(proxies[route]))
                await toProxy(ctx, next);
                return
            }
        }
        await next();
    }
}

function getStaticPath(ctx: Context, remotePaths: any[]) {
    const ua = ctx.header['user-agent']
    const isMobile = /AppleWebKit.*Mobile.*/i.test(ua)

    const remoteMap = {} as any

    for (const remote of remotePaths) {
        remoteMap[remote.route] = {
            ...remoteMap[remote.route],
            [remote.device || 'web']: remote.path,
        }
    }


    let staticPath = (isMobile && remoteMap["/"].mobile) || remoteMap["/"].web
    for (const path of Object.keys(remoteMap)) {
        const map = remoteMap[path]
        const url = ctx.url.replace('/dev', '')
        if (path !== '/' && url.startsWith(path)) {
            staticPath = (isMobile && map.mobile) || map.web
        }
    }
    return staticPath
}

export function staticProxy(remotePaths: any[], opts: any = {}) {
    return async function(ctx: Context, next: Next) {
        let done = false

        const staticPath = getStaticPath(ctx, remotePaths)
        
        if (!staticPath) {
            await next()
            return
        }

        ctx.config.staticPath = staticPath
        let basePath = ctx.path.replace('/dev', '')
        for (const remote of remotePaths) {
            if (remote.route === '/') {
                continue
            }
            if (basePath.startsWith(remote.route) && basePath !== remote.route) {
                basePath = basePath.replace(remote.route, '')
                break
            }
        }
        
        let path = basePath
        // const idx = basePath.indexOf('/static')
        // if (!basePath.startsWith('/static')) {
        //     const m = basePath.split('/static')
        //     console.log(777, m)
        //     path = '/static' + m[1]
        // }
        // const path = idx !== -1 ? basePath.slice(idx) : basePath

        console.log(666, staticPath, path)
    
        opts.root = staticPath
        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
            try {
                done = await send(ctx, path, opts)
            } catch (err) {
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