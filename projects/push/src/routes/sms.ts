import Router from 'koa-router';
import { smsClients  } from '@node-kits/aliyun'

const router = new Router({ prefix: '/sms' })
const sendEntity = [
    { name: 'phone', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'code', type: 'number' },
]

router.post('/send', async (ctx: any) => {
  const msg = ctx.validate(sendEntity)
  if (!msg.type) {
    throw new BaseError(100000001, 'type is not null')
  } 
  const sms = smsClients[msg.type]
  const body =  {
    code: msg.code,
 }
  try {
    const res = await sms.send(msg.phone, body)
    ctx.body = res
  } catch(e) {
    throw new BaseError(100000001, 'sms exucte error', e)
  }
})

export default router

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
