"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticProxy = exports.requestProxy = void 0;
const tslib_1 = require("tslib");
const aliyun_1 = require("../modules/aliyun");
// @ts-ignore
const koa2_connect_1 = tslib_1.__importDefault(require("koa2-connect"));
const koa_send_1 = tslib_1.__importDefault(require("koa-send"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const { aliyun } = aliyun_1.envConfig;
function requestProxy() {
    return function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { path } = ctx;
            const { httpProxy, apiProxy: serviceProxy } = aliyun_1.urlProxies;
            for (const route of Object.keys(httpProxy)) {
                if (path.match(route)) {
                    yield koa2_connect_1.default(http_proxy_middleware_1.createProxyMiddleware(aliyun_1.urlProxies.httpProxy[route]))(ctx, next);
                    return;
                }
            }
            for (const name of Object.keys(serviceProxy)) {
                const p = serviceProxy[name];
                if (path.startsWith(p.from)) {
                    yield aliyun_1.FCServiceProxy(ctx, name);
                    return;
                }
            }
            yield next();
        });
    };
}
exports.requestProxy = requestProxy;
function staticProxy() {
    return function (ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { res: stati } = aliyun;
            const mpath = ctx.path;
            if (!stati
                || (!stati.local && mpath.startsWith('/dev')
                    || ['/bff', '/api'].find(pre => mpath.startsWith(pre)))) {
                yield next();
                return;
            }
            let done = false;
            const path = ctx.path.replace('/dev', '');
            const root = stati[ctx.config.device].path;
            if (ctx.method === 'HEAD' || ctx.method === 'GET') {
                try {
                    done = yield koa_send_1.default(ctx, path, { root });
                }
                catch (err) {
                    console.error(err);
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
