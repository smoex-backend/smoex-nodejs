import Router from 'koa-router'
import * as sharedRoutes from './routes/shared'

// shared 相关 router
const sharedRouter = new Router({ prefix: '/data/shared'})
sharedRouter.post('/sync', sharedRoutes.syncData) // 同步数据
sharedRouter.get('/latest',  sharedRoutes.latestData)// 获得最新版本数据

// users 相关 router
const usersRouter = new Router({ prefix: '/data/users'})
usersRouter.post('/sync', sharedRoutes.syncData) // 同步数据
usersRouter.get('/latest',  sharedRoutes.latestData)// 获得最新版本数据

export default [
    sharedRouter,
    usersRouter,
]