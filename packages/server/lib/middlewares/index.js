"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticRemote = exports.initialize = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./normalize"), exports);
tslib_1.__exportStar(require("./proxy"), exports);
tslib_1.__exportStar(require("./vaildate"), exports);
exports.initialize = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    ctx.config = {};
    yield next();
});
exports.staticRemote = (remotePaths = []) => (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    //  const { remotePaths = [] } = ctx.config
    const ua = ctx.header['user-agent'];
    const isMobile = /AppleWebKit.*Mobile.*/i.test(ua);
    const remoteMap = {};
    for (const remote of remotePaths) {
        remoteMap[remote.route][remote.device || 'web'] = remote.path;
    }
    ctx.config.staticPath = (isMobile && remoteMap["/"].mobile) || remoteMap["/"].web;
    for (const path of Object.keys(remoteMap)) {
        const map = remoteMap[path];
        if (path !== '/' && ctx.url.startsWith(path)) {
            ctx.config.staticPath = (isMobile && map.mobile) || map.web;
        }
    }
    yield next();
});
