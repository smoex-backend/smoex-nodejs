import Router from 'koa-router'
import { guestAuth, loginSessionAuth } from './middlewares'
import * as accRoutes from './routes/acc'
import * as authRoutes from './routes/auth'

// acc root 相关 router
const accRouter = new Router({ prefix: '/acc'})
accRouter.get('/info', accRoutes.info) // 获得用户基本信息
accRouter.get('/logout', accRoutes.logout) // 用户退出
accRouter.post('/login', guestAuth, accRoutes.login) // 用户登录

// auth 相关 router
const authRouter = new Router({ prefix: '/acc/auth' })
authRouter.use(loginSessionAuth)
authRouter.post('/login', authRoutes.login) // 获得用户基本信息
authRouter.post('/regist', authRoutes.regist) // 用户鉴权信息补全

export default [
    accRouter,
    authRouter,
]