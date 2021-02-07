"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./normalize"), exports);
tslib_1.__exportStar(require("./proxy"), exports);
tslib_1.__exportStar(require("./vaildate"), exports);
const aliyun_1 = require("../modules/aliyun");
exports.initialize = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    ctx.url = aliyun_1.revertRequestUrl(ctx.url);
    const ua = ctx.header['user-agent'];
    const isMobile = /AppleWebKit.*Mobile.*/i.test(ua);
    const device = isMobile ? 'mobile' : 'web';
    ctx.config = { device };
    yield next();
});
