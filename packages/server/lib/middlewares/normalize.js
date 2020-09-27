"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeData = exports.normalizeError = void 0;
const tslib_1 = require("tslib");
const stream_1 = require("stream");
exports.normalizeError = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (error) {
        const { code = -1, message = 'unknow error' } = error, context = tslib_1.__rest(error, ["code", "message"]);
        ctx.body = { code, data: { message } };
        if (Object.keys(context).length) {
            ctx.body.context = context;
        }
    }
});
exports.normalizeData = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield next();
    // TODO: 寻求更好的判断方法 ing
    const isObject = typeof ctx.body === 'object' && !(ctx.body instanceof stream_1.PassThrough);
    if (isObject && typeof ctx.body.code === 'undefined') {
        const data = JSON.parse(JSON.stringify(ctx.body));
        ctx.body = { code: 0, data };
    }
});
