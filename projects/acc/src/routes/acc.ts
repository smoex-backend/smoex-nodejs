import { fcClients, redisClients } from "@jsk-env/aliyun";
import { RouterContext } from "koa-router";
import { decodeToken } from "../utils/jwt";

export async function login(ctx: RouterContext) {
  ctx.body = 'succes'
}

export async function logout(ctx: RouterContext) {
  ctx.body = { success: true }
  const redis = redisClients['auth']
  // @ts-ignore
  const cookieToken = ctx.cookies.get('token')
  if (!cookieToken) {
    return
  }
  const token = decodeToken(cookieToken)
  const accessKey = `[access:login]${token.uuid}`
  const session = await redis.getJSON(accessKey)
  // 用户未登录, 则不处理
  if (!session || !token.user) {
    return
  }
  await redis.del(accessKey)

  const fcAuth = fcClients['auth']
  // login 即忽略原始 token 获取新的 token
  const res = await fcAuth.get('/auth/users/token')
  if (res.headers['set-cookie']) {
    ctx.set('set-cookie', res.headers['set-cookie'])
  }
}

export async function info(ctx: RouterContext) {
  const fcAuth = fcClients['auth']
  const cookieToken = ctx.cookies.get('token')
  // 1. 设置默认返回值
  ctx.body = { id: 0 }
  if (cookieToken) {
    const token = decodeToken(cookieToken)
    // TODO: 不存在 user 需要请求
    ctx.body = token.user || ctx.body
  }
  const headers = {} as any
  if (ctx.headers['cookie']) {
    headers['Cookie'] = ctx.headers['cookie']
  }
  const res = await fcAuth.get('/auth/users/token', {}, { headers })
  if (res.headers['set-cookie']) {
    ctx.set('set-cookie', res.headers['set-cookie'])
  }
}
