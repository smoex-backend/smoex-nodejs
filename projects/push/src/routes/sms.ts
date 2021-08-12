import { RouterContext } from 'koa-router';
import { smsClients, aliyunConfigs } from '@jsk-aliyun/env'

export async function sendcode(ctx: RouterContext) {
  const params = ctx.jsk.params([
    { name: 'phone', type: 'string' },
    { name: 'code', type: 'string' },
    { name: 'template', type: 'string'}
  ])
  if (!params.phone || !params.code) {
    throw new Error('参数错误')
  }
  if (!aliyunConfigs.sms?.[params.template]) {
    params.template = 'checkcode'
  }
  const sms = smsClients[params.template]
  const body =  { code: params.code }
  try {
    ctx.body = await sms.send(params.phone, body)
  } catch(e) {
    throw new Error('发送失败')
  }
}
