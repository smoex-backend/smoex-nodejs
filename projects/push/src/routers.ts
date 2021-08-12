import Router from 'koa-router'
import * as smsRoutes from './routes/sms'

// sms 相关 router
const smsRouter = new Router({ prefix: '/push/sms'})
smsRouter.post('/sendcode',  smsRoutes.sendcode)// 获得最新版本数据

export default [
    smsRouter,
]