import { IRouterContext, RouterContext } from 'koa-router';
import { fcClients, redisClients } from '@jsk-aliyun/env'
import { decodeToken, randomCode, createUUID } from '../utils/jwt';
import * as wx from '../utils/wx'

type IAccessData = {
  type: 'phone' | 'wechat',
  target?: string, // phone number 或 app name
  extra?: any, // 第三方登录额外信息
  expired?: number
}

type ICheckData = {
  code?: string
  time?: number
  count?: number
}

type IJwtCheckData = {
  target: string
  scope: string
  type: 'phone',
}

type IJwtAuthData = {
  uuid: string
  check?: IJwtCheckData
}

type ISendCodeData = {
  code?: string
}

export async function getToken(ctx: RouterContext) {
  const token = ctx.cookies.get('token')
  const data: IJwtAuthData = {} as IJwtAuthData
  // 1. 不存在 token 则创建 token
  if (!token) {
    data.uuid = createUUID()
    // @ts-ignore
    ctx.auth.setToken(data)
    ctx.body = 'created token'
    return
  }
  const redis = redisClients['auth']
  // 2. 检查 token 是否过期
  try {
    const data = decodeToken(token) as IJwtAuthData
    // 3. 若 token 没有过期, 则刷新 token 的有效时间
    // @ts-ignore
    ctx.auth.setToken(data)
    // 获取 session 信息
    const accessKey = `[access:login]${data.uuid}`
    const session = await redis.getJSON<IAccessData>(accessKey)
    // 4. 若 token 中存在登录态, 则延长登陆态过期时间
    if (session && session.expired) {
      await redis.setex(accessKey, session.expired, JSON.stringify(session))
    }
    ctx.body = 'refreash token'
  } catch (e) {
    console.log(e)
    // token 若失效则新建 token, 登录无关, 仅 jwt token 时间
    data.uuid = createUUID()
    // @ts-ignore
    ctx.auth.setToken(data)
    ctx.body = 'exprired token'
  }
}

export async function thirdparty(ctx: IRouterContext) {
  const params = ctx.jsk.params([
    { name: 'code', type: 'string' },
    { name: 'platform', type: 'string' },
    { name: 'target', type: 'string' },
  ])

  if (!params.code || !params.platform || !wx.checkAppName(params.target)) {
    throw new Error('参数错误')
  }

  const redis = redisClients['auth']
  // @ts-ignore
  const { uuid } = ctx.auth.token

  const accessData: IAccessData = {
    type: params.platform,
  }
  if (params.platform === 'wechat') {
    accessData.extra = await wx.checkcode(params.code, params.target)
    accessData.target = accessData.extra.unionid || accessData.extra.openid
  } else {
    throw new Error('不支持登录的第三方账号')
  }

  // 第三方鉴权应该只有登录的场景
  const accessKey = `[access:login]${uuid}`
  // 验证同过后为短期验证, 默认10分钟有效期
  await redis.setex(accessKey, 10 * 60 , JSON.stringify(accessData))
  ctx.body = true
}

export async function checkcode(ctx: IRouterContext) {
  const redis = redisClients['auth']
  const params = ctx.jsk.params([
    { name: 'code', type: 'string' },
  ])
  // @ts-ignore
  const { uuid, check } = ctx.auth.token
  if (!params.code) {
    throw new Error('参数错误')
  }
  if (!check) {
    throw new Error('验证信息校验失败')
  }

  const verifyKey = `[check:${check.scope}]${uuid}`
  const data = await redis.getJSON(verifyKey)

  const accessData: IAccessData = { 
    type: check.type,
    target: check.target,
  }

  if (!data || data.code !== params.code) {
    throw new Error('验证失败')
  }
  await redis.del(verifyKey)

  const accessKey = `[access:${check.scope}]${uuid}`
  
  // 验证同过后为短期验证, 默认10分钟有效期
  await redis.setex(accessKey, 10 * 60 , JSON.stringify(accessData))
  ctx.body = '验证成功'
}

function matchTargetType(target: string) {
  return 'phone'
}

export async function sendcode(ctx: RouterContext) {
    const params = ctx.jsk.params([
      { name: 'target', type: 'string' },
      { name: 'scope', type: 'string' },
    ])

    if (!params.target || !['login'].includes(params.scope)) {
      throw new Error('参数错误')
    }

    // @ts-ignore
    const { token } = ctx.auth
    const redis = redisClients['auth']

    const accessKey = `[access:login]${token.uuid}`
    const session = redis.getJSON(accessKey)

    if (params.scope === 'login' && token.user && session) {
      throw new Error('用户已登录')
    }

    const fcPush = fcClients['push']
    const targetType = matchTargetType(params.target)
    const body: ISendCodeData = {}

    // 获取上次验证码相关数据
    const checkKey = `[check:${params.scope}]${token.uuid}`  
    const data = await redis.getJSON(checkKey)

    // 初始化 redis check data
    const checkData: ICheckData = { time: Date.now(), count: 0 }

    if (!data) {
      // 1. 如果 redis 中不存在 key, 正常发送验证码
      body.code = randomCode()
      checkData.code = body.code
    } else if (Date.now() - data.time > 60 * 1000) {
      // 2. 超时之前重新发送之前的验证码
      body.code = data.code
      checkData.code = body.code
      checkData.count = data.count + 1
    } else {
      throw new Error('操作频繁: ' + ( 60 - ((Date.now() - data.time) / 1000)))
    }
    
    console.log('send code: ', data)

    const onSendFailure = async (e: Error) => {
      if (checkData.count === 0) {
        await redis.del(checkKey)
        throw new Error(e.message)
      }
    }

    // 验证发送信息的类型
    if (targetType === 'phone') {
      // 验证码数据写入 redis
      await redis.setex(checkKey, 5 * 60, JSON.stringify(checkData))
      // 发送 sms
      const sendBody = { ...body, phone: params.target  }
      const res = await fcPush.post('/push/sms/sendcode', sendBody).catch(onSendFailure)
      if (res.data?.code !== 0) {
        await onSendFailure(new Error('验证码发送失败'))
      }
      ctx.body = '验证码发送成功!'
    } else {
      throw new Error('不支持发送消息的类型')
    }

    if (!token.check) {
      // 将不重要的信息用 jwt 传给客户端, 方便扩展
      const jwtCheckData: IJwtCheckData = { 
        target: params.target,
        scope: params.scope,
        type: targetType,
      } 
      const jwtAuthData: IJwtAuthData = { uuid: token.uuid, check: jwtCheckData }
      // @ts-ignore
      ctx.auth.setToken(jwtAuthData)
    }
}