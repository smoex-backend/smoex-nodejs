import { RouterContext } from "koa-router";
import { redisClients } from '@jsk-aliyun/env'
import * as usersDao from '../daos/users'

type IAccessData = {
  type: 'phone' | 'wechat',
  target?: string, // phone number 或 app name
  extra?: any, // 第三方登录额外信息
  expired?: number
}

const ACCESS_TYPE_MAP = {
  'wechat': 1,
  'phone': 1,
  'email': 2,
}

function isAccessTokenType(type: string) {
  return ['wechat'].includes(type)
}

export async function login(ctx: RouterContext) {
  const redis = redisClients['auth']
  // @ts-ignore
  const { token, session, sessionKey } = ctx.auth
  const accessType = ACCESS_TYPE_MAP[session.type as keyof typeof ACCESS_TYPE_MAP]
  if (!accessType) {
    throw new Error('不支持的鉴权类型')
  }
  let user: any
  if (isAccessTokenType(session.type)) {
    user = await usersDao.getByAccessToken(session.target, accessType)
  } else {
    user = await usersDao.getByVerification(session.target, accessType)
  }
  if (user && !token.user) {
    // 登录成功后保持7天登录有效期
    session.expired = 7 * 24 * 60 * 60
    await redis.setex(sessionKey, session.expired, JSON.stringify(session)) 
    const jwtAuthData = { uuid: token.uuid, user }
    // @ts-ignore
    ctx.auth.setToken(jwtAuthData)
    ctx.body = { success: true }
  } else if (user) {
    ctx.body = { success: true, message: '用户已登录' }
  } else {
    ctx.body = { success: false, message: '用户不存在' }
  }
}

export async function regist(ctx: RouterContext) {
  const params = ctx.jsk.params([
    { name: 'nickname', type: 'string' },
    { name: 'avatar_url', type: 'string' },
  ])
  if (!params.nickname) {
    throw new Error('参数错误')
  }
  if (!params.avatar_url) {
    params.avatar_url = 'default_avatar'
  }
  const redis = redisClients['auth']
  // @ts-ignore
  let { token, session, sessionKey } = ctx.auth

  const accessType = ACCESS_TYPE_MAP[session.type as keyof typeof ACCESS_TYPE_MAP]
  if (!accessType) {
    throw new Error('不支持的鉴权类型')
  }

  let user: any
  if (isAccessTokenType(params.type)) {
    user = await usersDao.saveAndBindAccessToken({
      ...params,
      type: accessType,
      extra: session.extra,
    })
  } else {
    user = await usersDao.saveAndBindVerification({
      ...params,
      type: accessType,
      target: session.target,
    })
  }

  // 注册完成后自动登录
  session.expired = 7 * 24 * 60 * 60
  await redis.setex(sessionKey, session.expired, JSON.stringify(session)) 
  const jwtAuthData = { uuid: token.uuid, user }
  // @ts-ignore
  ctx.auth.setToken(jwtAuthData)
  ctx.body = { success: true }
}

