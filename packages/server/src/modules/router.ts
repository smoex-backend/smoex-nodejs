
import fs from 'fs'
import path from 'path'
import { PassThrough } from 'stream'
import kstatic from 'koa-static'
// TODO: 暂时先用这个 middleware, 路由匹配规则之后根据业务需求自己实现 
//（主要考虑和 koa-router 规则保持一致与目前正则方案的优劣）
import Router from 'koa-router'
import { Context } from 'koa'
import { AxiosInstance } from 'axios'
import { Store } from 'redux'
import qs from 'qs'

// @ts-ignore
import OSS from 'ali-oss'
	
// smoex-public.oss-cn-shanghai.aliyuncs.com
const devEndpoint = 'https://smoex-public.oss-cn-shanghai.aliyuncs.com'
const prodEndpoint = 'https://smoex-public.oss-cn-shanghai-internal.aliyuncs.com'

const client = new OSS({
  region: 'oss-cn-shanghai',
  accessKeyId: 'LTAI694joxMGgHJa',
  accessKeySecret: 'siOZ41IRUliP6mzca7BfejgvP5furM',
  bucket: 'smoex-public',
  endpoint: process.env.OSS_ENV === 'development' ? devEndpoint : prodEndpoint,
  secure: true, 
  cname: true,
});


type ISSRRefs = {
    store: Store
    proxy: AxiosInstance
}

type ISSRModule = {
    render: (url: string) => NodeJS.ReadableStream
    dispatch?: (url: string) => any
    getRefs: () => ISSRRefs
}

type ISSRStreamOpts = {
    url: string,
    shtml: string,
}


const router = new Router()

router.get('/api/*', async (ctx, next) => {
    throw { code: -1, message: "api not found" }
})


router.get('*', async (ctx: any, next) => {

    let { 
        staticPath = '', 
        ssrModulePath = '',
        excludeStaticPaths = ['/dev', '/api', '/bff'],
    } = ctx.config

    if (excludeStaticPaths.find((path: string) => ctx.url.startsWith(path))) {
        await next()
        return
    }


    const indexPath = `${staticPath}/index.html`
    let shtml = process.env.NODE_ENV === 'production' 
        ? (await client.get(indexPath)).content.toString()
        : await readFile(indexPath)

    ctx.type = 'html'
    ctx.body  = shtml

    // TODO: 简单测试了并发场景，并没有出现数据污染的问题
    // 但理论上应该存在问题（store 和 axios 只有单例）
    // PS: 并发场景下请求会比较慢倒是事实
    if (ssrModulePath && shtml.includes('isomorphic=yes')) {
        const serverIndexPath = `${ssrModulePath}/index.js`
        const ssr = await getSSRModule(serverIndexPath) as ISSRModule
        const { proxy } = ssr.getRefs?.() || {}
        if (proxy) {
            setServerProxyOptions(ctx, proxy)
        }
        const opts = { shtml, url: ctx.url }
        ctx.body = await renderHtmlStream(ssr, opts)
    }
})

export default router

export function createRouter(prefix: string) {
    return new Router({ prefix })
}

function splitHtmlString(shtml: string) {
    return shtml
        .replace('</head>', '@{head-before}' + '</head>')
        .replace('</body>', '@{body-before}' + '</body>')
        .replace('</main>',  '</main>' + '@{main-after}')
        .replace(/<main.*?>.*?<\/main>/, str => {
            const root = str.match(/>.*</)?.[0].slice(1, -1)
            return root ? str.replace(root, '@{render}') : str
        })
        .split(/@{body-before}|@{head-before}|@{main-after}|@{render}/)
}

async function renderHtmlStream(ssr: ISSRModule, opts: ISSRStreamOpts) {
    const stream = new PassThrough()
    const [headBefore, mainBefore, mainAfter, bodyBefore, htmlEnd] = splitHtmlString(opts.shtml)
    stream.push(headBefore)
    stream.push(mainBefore)

    const { store } = ssr.getRefs()
    
    await ssr.dispatch?.(opts.url)
    const state = store.getState()
    const render = ssr.render(opts.url)
    console.log(render)
    render.pipe(stream, { end: false })
    
    render.on('end', () => {
        stream.push(mainAfter)
        if (state) {
            const windowState = 'window.__PRELOAD_STATE__'
            const data = `<script>${windowState} = ${JSON.stringify(state)}</script>`
            stream.push(data)
        }
        stream.push(bodyBefore)
        stream.push(htmlEnd)
        stream.push(null)
    })
    return stream
}

const acceptRespHeaders = [
    'set-cookie', 
]

function setServerProxyOptions(ctx: Context, proxy: AxiosInstance) {
    proxy.defaults.transformRequest = params => {
        return qs.stringify(params)
    }
    proxy.defaults.baseURL = 'http://localhost:9000/api'
    const reqHeaders = proxy.defaults.headers
    proxy.defaults.headers = {
        ...reqHeaders,
        ...ctx.headers,
    }

    proxy.interceptors.response.use(resp => {
        for (const name of Object.keys(resp.headers || {})) {
            if (acceptRespHeaders.includes(name)) {
                ctx.res.setHeader(name, resp.headers[name])
            }
        }
        return resp.data
    })
}

async function getSSRModule(filepath: string) {
    const ssrPath = path.resolve(filepath)
    delete require.cache[ssrPath]
    return await require(ssrPath)
}

function readFile(filepath: any) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(data)
        })
    })
}
