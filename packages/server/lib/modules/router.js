"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const stream_1 = require("stream");
// TODO: 暂时先用这个 middleware, 路由匹配规则之后根据业务需求自己实现 
//（主要考虑和 koa-router 规则保持一致与目前正则方案的优劣）
const koa_router_1 = tslib_1.__importDefault(require("koa-router"));
const qs_1 = tslib_1.__importDefault(require("qs"));
// @ts-ignore
const ali_oss_1 = tslib_1.__importDefault(require("ali-oss"));
// smoex-public.oss-cn-shanghai.aliyuncs.com
const devEndpoint = 'https://smoex-public.oss-cn-shanghai.aliyuncs.com';
const prodEndpoint = 'https://smoex-public.oss-cn-shanghai-internal.aliyuncs.com';
const client = new ali_oss_1.default({
    region: 'oss-cn-shanghai',
    accessKeyId: 'LTAI694joxMGgHJa',
    accessKeySecret: 'siOZ41IRUliP6mzca7BfejgvP5furM',
    bucket: 'smoex-public',
    endpoint: process.env.OSS_ENV === 'development' ? devEndpoint : prodEndpoint,
    secure: true,
    cname: true,
});
const router = new koa_router_1.default();
router.get('/api/*', (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    throw { code: -1, message: "api not found" };
}));
router.get('*', (ctx, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { staticPath = '', ssrModulePath = '', excludeStaticPaths = ['/dev', '/api', '/bff'], } = ctx.config;
    if (excludeStaticPaths.find((path) => ctx.url.startsWith(path))) {
        yield next();
        return;
    }
    const indexPath = `${staticPath}/index.html`;
    let shtml = process.env.NODE_ENV === 'production'
        ? (yield client.get(indexPath)).content.toString()
        : yield readFile(indexPath);
    ctx.type = 'html';
    ctx.body = shtml;
    // TODO: 简单测试了并发场景，并没有出现数据污染的问题
    // 但理论上应该存在问题（store 和 axios 只有单例）
    // PS: 并发场景下请求会比较慢倒是事实
    if (ssrModulePath && shtml.includes('isomorphic=yes')) {
        const serverIndexPath = `${ssrModulePath}/index.js`;
        const ssr = yield getSSRModule(serverIndexPath);
        const { proxy } = ((_a = ssr.getRefs) === null || _a === void 0 ? void 0 : _a.call(ssr)) || {};
        if (proxy) {
            setServerProxyOptions(ctx, proxy);
        }
        const opts = { shtml, url: ctx.url };
        ctx.body = yield renderHtmlStream(ssr, opts);
    }
}));
exports.default = router;
function createRouter(prefix) {
    return new koa_router_1.default({ prefix });
}
exports.createRouter = createRouter;
function splitHtmlString(shtml) {
    return shtml
        .replace('</head>', '@{head-before}' + '</head>')
        .replace('</body>', '@{body-before}' + '</body>')
        .replace('</main>', '</main>' + '@{main-after}')
        .replace(/<main.*?>.*?<\/main>/, str => {
        var _a;
        const root = (_a = str.match(/>.*</)) === null || _a === void 0 ? void 0 : _a[0].slice(1, -1);
        return root ? str.replace(root, '@{render}') : str;
    })
        .split(/@{body-before}|@{head-before}|@{main-after}|@{render}/);
}
function renderHtmlStream(ssr, opts) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const stream = new stream_1.PassThrough();
        const [headBefore, mainBefore, mainAfter, bodyBefore, htmlEnd] = splitHtmlString(opts.shtml);
        stream.push(headBefore);
        stream.push(mainBefore);
        const { store } = ssr.getRefs();
        yield ((_a = ssr.dispatch) === null || _a === void 0 ? void 0 : _a.call(ssr, opts.url));
        const state = store.getState();
        const render = ssr.render(opts.url);
        console.log(render);
        render.pipe(stream, { end: false });
        render.on('end', () => {
            stream.push(mainAfter);
            if (state) {
                const windowState = 'window.__PRELOAD_STATE__';
                const data = `<script>${windowState} = ${JSON.stringify(state)}</script>`;
                stream.push(data);
            }
            stream.push(bodyBefore);
            stream.push(htmlEnd);
            stream.push(null);
        });
        return stream;
    });
}
const acceptRespHeaders = [
    'set-cookie',
];
function setServerProxyOptions(ctx, proxy) {
    proxy.defaults.transformRequest = params => {
        return qs_1.default.stringify(params);
    };
    proxy.defaults.baseURL = 'http://localhost:9000/api';
    const reqHeaders = proxy.defaults.headers;
    proxy.defaults.headers = Object.assign(Object.assign({}, reqHeaders), ctx.headers);
    proxy.interceptors.response.use(resp => {
        for (const name of Object.keys(resp.headers || {})) {
            if (acceptRespHeaders.includes(name)) {
                ctx.res.setHeader(name, resp.headers[name]);
            }
        }
        return resp.data;
    });
}
function getSSRModule(filepath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ssrPath = path_1.default.resolve(filepath);
        delete require.cache[ssrPath];
        return yield require(ssrPath);
    });
}
function readFile(filepath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filepath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}
