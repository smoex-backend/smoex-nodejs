import Router from 'koa-router'
import * as usersRoutes from './routes/users'
import { guestAuth } from './middlewares'

// users 相关 router
const usersRouter = new Router({ prefix: '/auth/users'})
usersRouter.get('/token', usersRoutes.getToken) // 检查验证码
usersRouter.post('/sendcode', guestAuth, usersRoutes.sendcode) // 发送验证码
usersRouter.post('/checkcode', guestAuth, usersRoutes.checkcode) // 校验验证码
usersRouter.post('/thirdparty', guestAuth, usersRoutes.thirdparty) // 第三方鉴权

export default [
    usersRouter,
]