import Koa from 'koa'
import { decodeToken } from '../utils/jwt'

export async function checkAuth(ctx: Koa.Context, next: Koa.Next) {
    const token = ctx.cookies.get('token')
    // 1. 判断 token 是否存在
    if (!token) {
        throw new Error('Uncheck token in cookie')
    }
    // 2. 判断 token 是否失效
    ctx.auth = ctx.auth || {}
    ctx.auth.token = decodeToken(token)
    return await next()
}