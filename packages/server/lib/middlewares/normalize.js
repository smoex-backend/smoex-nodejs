"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeData = exports.normalizeError = exports.ERROR_CODE = void 0;
const tslib_1 = require("tslib");
const stream_1 = require("stream");
exports.ERROR_CODE = {
    UNKNOW: 10000000000,
    NOTFOUND: 40000000000,
};
exports.normalizeError = (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (err) {
        console.log(err);
        if (!err.message) {
            err.message = 'Unknow Error';
        }
        if (!err.code) {
            err.code = -1;
        }
        if (err.code >= exports.ERROR_CODE.UNKNOW) {
            const { code, message } = err, context = tslib_1.__rest(err, ["code", "message"]);
            ctx.body = Object.assign({ code, data: { message } }, context);
            return;
        }
        const logMessage = `Internal Server Error: ${err.message}; ${JSON.stringify(err)}; ${new Date().toISOString()}`;
        console.error(logMessage + `; ${JSON.stringify(ctx)}`);
        if (err.code >= 100 && err.code <= 9999) {
            ctx.body = logMessage;
            ctx.status = err.code;
        }
        else {
            ctx.body = logMessage;
            ctx.status = 500;
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
