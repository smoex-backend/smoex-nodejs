import { decodeToken, encodeToken, delayDate } from '../utils'
import Cookies from 'cookies'
import Koa from 'koa'
import { redisClients, revertRequestUrl } from '@jsk-aliyun/env'

export async function configure(ctx: Koa.Context, next: Koa.Next) {
    ctx.url = revertRequestUrl(ctx.url)
    ctx.env = ctx.env || {}
    ctx.env.internal = true
    if (ctx.env.internal) { // internal
        ctx.headers['x-forwarded-proto'] = 'https'
    }
    ctx.auth = ctx.auth || {}
    ctx.auth.setToken = (data: any) => {
        const expires = delayDate(60 * 60 * 24 * 30)
        const options: Cookies.SetOption = true 
            ? { secure: true, sameSite: 'none', expires } 
            : { sameSite: 'strict' , expires }
        ctx.cookies.set('token', encodeToken(data), options )
    }
    // 如果 token 失效则需要 try-catch 处理
    ctx.auth.getToken = () => {
        const token = ctx.cookies.get('token')
        if (!token) {
            // 1. token 不存在, 直接返回
            return
        }
        try {
            // 2. token 是否过期
            return decodeToken(token)
        } catch (e) {
            console.log(e)
            // 如果 token 长时间没有更新而过期, 判定为非法访问
            throw new Error('非法访问')
        }
    }
    await next();
}

// 登陆态鉴权强校验 session 登陆态是否存在
export async function loginSessionAuth(ctx: Koa.Context, next: Koa.Next) {
    return await guestAuth(ctx, async () => {
        const redis = redisClients['auth']
        // @ts-ignore
        const { token } = ctx.auth
        const accessKey = `[access:login]${token.uuid}`
        const session = await redis.getJSON(accessKey)
        // 1. 若 session 失效或不存在, 且 token 中不存在用户信息, 则判定为鉴权失效或非法访问
        if (!session && !token.user) {
            throw new Error('非法访问')
        }
        // 2. 若 session 失效或不存在, 且 token 中存在用户信息, 则为登录失效的状态
        if (!session && token.user) {
            throw new Error('登录已失效')
        }
        // 3. 若存在 session 信息, 则是已登录状态
        ctx.auth.session = session
        ctx.auth.sessionKey = accessKey
        return await next()
    })
}

// 游客鉴权需要强验证 token 和 uuid 存在
export async function guestAuth(ctx: Koa.Context, next: Koa.Next) {
    const token = ctx.auth.getToken()
    // 1. 判断 token 是否存在
    if (!token) {
        throw new Error('Uncheck token in cookie')
    }
    ctx.auth.token = token
    // 2. 判断 token uuid 是否存在
    if (!ctx.auth.token.uuid) {
        throw new Error('Uncheck uuid in token')
    }
    return await next()
}

export async function internalAuth(ctx: Koa.Context, next: Koa.Next) {
    if (false) {
        throw new Error('only allow internal auth')
    }
    return await next()
}