// @ts-ignore
import OSS from 'ali-oss'
// @ts-ignore
import FC from '@alicloud/fc2'
import fs from 'fs'
import toml from 'toml'
import path from 'path'
import _merge from 'lodash/merge'

export const envConfig = readEnvConfigs()
const { aliyun, auth, proxy } = envConfig

export const ossStatic = createOSSClient(aliyun.res!)
export const fcServices = createFCService(aliyun.api!)
export const urlProxies = createProxy(proxy)


export type IAliyunResItem = {
    package: string,
    path?: string,
}

export type IAliyunApiItem = {
    alias: string,
    host?: string,
}

type IAliyunRes = {
    local?: boolean,
    region: string,
    bucket: string,
} & {
    [key in string]: IAliyunResItem
}

type IAliyunApi = {
    proxy?: boolean,
    region: string,
    alias: string,
} & {
    [key in string]: IAliyunApiItem
}

type IAliyunAuth = {
    accessKeyId: string,
    accessKeySecret: string,
    accountId: number,
}
type IAuthConfigs = {
    aliyun: IAliyunAuth,
}

type IAliyunConfigs = {
    res: IAliyunRes,
    api: IAliyunApi,
    dev?: boolean,
}
type IProxyConfigs = {
    [key in string]?: {
        to: string,
        target: string,
    }
}

export function createFCClient(service: IAliyunApiItem) {
    const client = new FC(auth.aliyun?.accountId, {
        accessKeyID: auth.aliyun?.accessKeyId,
        accessKeySecret: auth.aliyun?.accessKeySecret,
        region: aliyun.api?.region,
        internal: !aliyun.dev,
    })

    const methods = ['get', 'post', 'put', 'delete']
    const { serviceName, functionName } = revertAliasrName(service.alias)
    const proxy = { } as any
    const pathPrefix = `/proxy/${serviceName}/${functionName}`
    for (const key of methods) {
        proxy[key] = async (mpath: string, ...args: any[]) => {
            const res = await client[key](`${pathPrefix}${mpath}`, ...args)

            return res.data
        }
    }
    proxy['request'] = async (method: string, mpath: string, ...args: any[]) => {
        const res = await client.request(method, `${pathPrefix}${mpath}`, ...args)
        return res.data
    }
    return proxy
}
// TODO 采用 http 的方式去访问 aliyun api
export function createHTTPClient(service: IAliyunApiItem) {
}
export function createOSSClient(client: IAliyunRes) {
    const internal = !aliyun.dev ? '-internal' : '';
    const endpoint = `https://${client.bucket}.${client.region}${internal}.aliyuncs.com`
    return new OSS({
        accessKeyId: auth.aliyun?.accessKeyId,
        accessKeySecret: auth.aliyun?.accessKeySecret,
        region: client.region,
        bucket: client.bucket,
        endpoint,
        secure: true, 
        cname: true,
    })
}

export function revertRequestUrl(url: string) {
    const fcVersion = '2016-08-15'
    const { functionName } = revertAliasrName(aliyun.api?.alias!)
    return url.replace(new RegExp(`/${fcVersion}/proxy(\/.*?\/)${functionName}`), '')
}


export async function FCServiceProxy(ctx: any, name: any) {
    const { request: req } = ctx
    const { from , to } = urlProxies.apiProxy[name]
    const fc = fcServices[name]
    const res = await fc.request(
        req.method, 
        ctx.url.replace(from, to),
    )
    ctx.body = res 
}

function readEnvConfigs() {
    const auth = readAsToml<IAuthConfigs>('config/auth')
    const aliyun = readAsToml<IAliyunConfigs>('config/aliyun')
    const proxy = readAsToml<IProxyConfigs>('config/proxy')
    return { auth, aliyun, proxy }
}

function createFCService(config: IAliyunApi) {
    const services = {} as any
    for (const key of Object.keys(config)) {
        const val = config[key]
        if (!val || !val.alias) {
            continue
        }
        services[key] = createFCClient(val)
    }
    return services
}


function createProxy(config: IProxyConfigs) {
    const httpProxy = {} as any
    const apiProxy = {} as any
    for (const from of Object.keys(config)) {
        const conf = config[from]
        if (typeof conf !== 'object') {
            continue
        }
        const { to, target } = conf
        if (target.startsWith('api://')) {
            const serviceName = target.replace('api://', '')
            apiProxy[serviceName] = { from, to }
            continue
        }

        httpProxy[`^${from}`] = {
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^${from}`]: to,
            }
        }
    } 
    return { httpProxy, apiProxy }
}

function readAsToml<T = any>(resolvePath: string): Partial<T> {
    const mpath = path.resolve(`./${resolvePath}.toml`)
    const devpath = path.resolve(`./${resolvePath}.dev.toml`)
    let res = {} as T
    if (fs.existsSync(mpath)) {
        const str = fs.readFileSync(mpath, 'utf-8')
        res = toml.parse(str)
    }
    if (fs.existsSync(devpath)) {
        const str = fs.readFileSync(devpath, 'utf-8')
        res = _merge(res, toml.parse(str), { dev: true })
    }
    return res
}

function revertAliasrName(serverName: string) {
    const [name, code, version] = serverName.split('\.')
    const serviceName = `${name}-${name}-${code}.${version || name}`
    return { serviceName, functionName: name }
}

// function getRemotePath() {
//     const fcVersion = '2016-08-15'
//     const { serviceName, functionName } = revertServerName(aliyun.server?.serverName!)
//     return `/${fcVersion}/proxy/${serviceName}/${functionName}`
// }
