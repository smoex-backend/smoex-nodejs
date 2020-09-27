
import { 
    initialize,
    normalizeData,
    normalizeError,
    vaildateParams,
} from '../middlewares'
import Router from 'koa-router'
import { Config } from 'http-proxy-middleware';
import app from './app'
import baseRouter from './router'

export type IHttpProxyConfig = Record<string, Config>

type IServerConfigure = {
    routers?: Router[],
    middlewares?: any,
    proxies?: any,
    httpProxy?: IHttpProxyConfig,
}

const defaultHttpProxy: IHttpProxyConfig = {
    // '/api/(.*)': {
    //     changeOrigin: true,
    //     target: 'http://gateway.smoex.com',
    // },
}

export const createServer = (config: IServerConfigure = {}) => {
    const {
        routers = [],
        middlewares = {},
        proxies = {},
    } = config

    app.use(initialize)

    const { 
        configure, 
    } = middlewares

    if (configure) {
        app.use(configure)
    }
    app.use(normalizeError)

    if (proxies.static) {
        app.use(proxies.static)
    }

    app.use(normalizeData)
    app.use(vaildateParams)

    routers.forEach(router => {
        app.use(router.routes())
        app.use(router.allowedMethods())
    })

    if (proxies.request) {
        app.use(proxies.request)
    }

    app.use(baseRouter.routes())
    app.use(baseRouter.allowedMethods())

    return app
}
