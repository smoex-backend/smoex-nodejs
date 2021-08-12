import Router from 'koa-router'
import { loginSessionAuth } from './middlewares'
import * as sharedRoutes from './routes/shared'
import * as usersRouters from './routes/users'

// shared 相关 router
const sharedRouter = new Router({ prefix: '/data/shared'})
sharedRouter.get('/',  sharedRoutes.latestData)// 获得最新版本数据
sharedRouter.post('/sync', sharedRoutes.syncData) // 同步数据

// users 相关 router
const usersRouter = new Router({ prefix: '/data/users'})
usersRouter.use(loginSessionAuth)
usersRouter.get('/', usersRouters.latestData)// 获得最新版本数据
usersRouter.post('/sync', usersRouters.syncData) // 同步数据

export default [
    sharedRouter,
    usersRouter,
]