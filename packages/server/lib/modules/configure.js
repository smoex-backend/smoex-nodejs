"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const tslib_1 = require("tslib");
const middlewares_1 = require("../middlewares");
const app_1 = tslib_1.__importDefault(require("./app"));
const router_1 = tslib_1.__importDefault(require("./router"));
const defaultHttpProxy = {
// '/api/(.*)': {
//     changeOrigin: true,
//     target: 'http://gateway.smoex.com',
// },
};
exports.createServer = (config = {}) => {
    const { routers = [], middlewares = {}, proxies = {}, } = config;
    app_1.default.use(middlewares_1.initialize);
    const { configure, } = middlewares;
    if (configure) {
        app_1.default.use(configure);
    }
    app_1.default.use(middlewares_1.normalizeError);
    if (proxies.static) {
        app_1.default.use(proxies.static);
    }
    app_1.default.use(middlewares_1.normalizeData);
    app_1.default.use(middlewares_1.vaildateParams);
    routers.forEach(router => {
        app_1.default.use(router.routes());
        app_1.default.use(router.allowedMethods());
    });
    if (proxies.request) {
        app_1.default.use(proxies.request);
    }
    app_1.default.use(router_1.default.routes());
    app_1.default.use(router_1.default.allowedMethods());
    return app_1.default;
};
