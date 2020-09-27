"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const koa_1 = tslib_1.__importDefault(require("koa"));
const koa_json_1 = tslib_1.__importDefault(require("koa-json"));
const koa_bodyparser_1 = tslib_1.__importDefault(require("koa-bodyparser"));
const koa_logger_1 = tslib_1.__importDefault(require("koa-logger"));
const app = new koa_1.default();
// error handler
// onerror(app)
// middlewares
app.use(koa_bodyparser_1.default({
    enableTypes: ['json', 'form', 'text']
}));
app.use(koa_json_1.default({ pretty: false }));
app.use(koa_logger_1.default());
// logger
app.use((ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const start = new Date();
    yield next();
    const ms = +new Date() - +start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
}));
// error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// });
exports.default = app;
