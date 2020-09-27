"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticProxy = exports.requestProxy = void 0;
const tslib_1 = require("tslib");
const httpProxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const pathToRegexp = require('path-to-regexp');
const send = require('koa-send');
function requestProxy(proxies = {}) {
    return function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { path = '' } = ctx;
            for (const route of Object.keys(proxies)) {
                if (path.match(route)) {
                    const toProxy = k2c(httpProxy(proxies[route]));
                    yield toProxy(ctx, next);
                    return;
                }
            }
            yield next();
        });
    };
}
exports.requestProxy = requestProxy;
function getStaticPath(ctx, remotePaths) {
    const ua = ctx.header['user-agent'];
    const isMobile = /AppleWebKit.*Mobile.*/i.test(ua);
    const remoteMap = {};
    for (const remote of remotePaths) {
        remoteMap[remote.route] = Object.assign(Object.assign({}, remoteMap[remote.route]), { [remote.device || 'web']: remote.path });
    }
    let staticPath = (isMobile && remoteMap["/"].mobile) || remoteMap["/"].web;
    for (const path of Object.keys(remoteMap)) {
        const map = remoteMap[path];
        const url = ctx.url.replace('/dev', '');
        if (path !== '/' && url.startsWith(path)) {
            staticPath = (isMobile && map.mobile) || map.web;
        }
    }
    return staticPath;
}
function staticProxy(remotePaths, opts = {}) {
    return function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let done = false;
            const staticPath = getStaticPath(ctx, remotePaths);
            if (!staticPath) {
                yield next();
                return;
            }
            ctx.config.staticPath = staticPath;
            let basePath = ctx.path.replace('/dev', '');
            for (const remote of remotePaths) {
                if (remote.route === '/') {
                    continue;
                }
                if (basePath.startsWith(remote.route) && basePath !== remote.route) {
                    basePath = basePath.replace(remote.route, '');
                    break;
                }
            }
            let path = basePath;
            // const idx = basePath.indexOf('/static')
            // if (!basePath.startsWith('/static')) {
            //     const m = basePath.split('/static')
            //     console.log(777, m)
            //     path = '/static' + m[1]
            // }
            // const path = idx !== -1 ? basePath.slice(idx) : basePath
            console.log(666, staticPath, path);
            opts.root = staticPath;
            if (ctx.method === 'HEAD' || ctx.method === 'GET') {
                try {
                    done = yield send(ctx, path, opts);
                }
                catch (err) {
                    if (err.status !== 404) {
                        throw err;
                    }
                }
            }
            if (!done) {
                yield next();
            }
        });
    };
}
exports.staticProxy = staticProxy;
