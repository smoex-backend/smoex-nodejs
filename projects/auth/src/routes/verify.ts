import Router, { RouterContext } from 'koa-router';
import { fcClients, redisClients } from '@node-kits/aliyun'
import { checkAuth } from './middleware';
import { v4 as uuidv4 } from 'uuid'
import { decodeToken, encodeToken } from '../utils/jwt';
const router = new Router({ prefix: '/verify' })
export default router


const sendEntity = [
    { name: 'target', type: 'string' },
]

const fcPush = fcClients['push']
const redis = redisClients['auth']

router.get('/token', _token)
router.post('/send', checkAuth, _send)
router.post('/check', checkAuth, _check)

async function _send(ctx: any) {
  const msg = ctx.validate(sendEntity)
  const { uuid } = ctx.auth.token
  const body = {
    type: 'verify',
    phone: msg.target,
  } as any
  const redisKey = 'verify:' + uuid

  const str = await redis.get(redisKey)
  const data = str && JSON.parse(str)
  // 1. 如果 redis 中不存在 key, 正常发送验证码
  if (!data) {
    body.code = randomCode()
    const rdata = JSON.stringify({ 
      code: body.code, 
      time: Date.now(),
      count: 0,
    })
    await redis.setex(redisKey, 5 * 60, rdata)
    // 发送 sms
    try {
      const res = await fcPush.get('/sms/send', body)
      ctx.body = res
      ctx.body = 'created code'
    } catch(e) {
      await redis.del(redisKey)
      console.log(e)
      ctx.body = e
    }
    return
  } 
  // 2. 超时之前重新发送之前的验证码
  if (Date.now() - data.time > 60 * 1000) {
    
    body.code = data.code
    const rdata = JSON.stringify({ 
      code: body.code, 
      time: Date.now(),
      count: data.count + 1,
    })
    await redis.setex(redisKey, 5 * 60, rdata)
    // 发送 sms
    const res = await fcPush.post('/sms/send', body).catch(console.log)
    // ctx.body = 'refreash code'
    ctx.body = res
    return
  } else {
    throw new BaseError(1000000, '操作频繁: ' + ( 60 - ((Date.now() - data.time) / 1000)))
  }
}

const checkEntity = [{ name: 'code', type: 'number' }]
async function _check(ctx: any) {
  const msg = ctx.validate(checkEntity)
  const { uuid } = ctx.auth.token
  const verifyKey = 'verify:' + uuid

  const str = await redis.get(verifyKey)
  const data = str && JSON.parse(str)

  if (!data || data.code !== msg.code) {
    throw new BaseError(1000000, '验证失败')
  }
  await redis.del(verifyKey)
  ctx.body = 'success'
}

async function _token(ctx: RouterContext) {
  const token = ctx.cookies.get('token')
  const data = {} as any
  // 1. 不存在 token 则创建 token
  if (!token) {
    data.uuid = uuidv4().replace(/-/g, '')
    const str = encodeToken(data)
    ctx.cookies.set('token', str)
    ctx.body = 'created token'
    return
  }
  // 2. 检查 token 是否过期
  try {
    const str = decodeToken(token)
    ctx.body = 'before token'
    console.log(str)
  } catch (e) {
    console.log(e)
    // token 若失效则新建 token
    data.uuid = uuidv4().replace(/-/g, '')
    const str = encodeToken(data)
    ctx.cookies.set('token', str)
    ctx.body = 'exprired token'
  }
}

function randomCode() {
  let num = ''
  for (let i = 0; i < 6; i++) {
    num += Math.floor(Math.random() * 10)
  }
  return parseInt(num)
}


export class BaseError {
  public code: number
  public message: string
  public context: any

  constructor(code: number, message: string, context?: any) {
    this.code = code
    this.message = message
    this.context = context
  }
}