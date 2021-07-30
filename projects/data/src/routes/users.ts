import Router from 'koa-router'
// const router = new Router({ prefix: '/data/users' })
// export default router

import * as usersDao from '../daos/users'

// // 同步用户数据
// router.post('/sync', _syncData)
// router.get('/latest', _latestData)

export async function syncData(ctx: any) {
    const rbody = ctx.request.body
    if (!rbody.name || !ctx.query.uid) {
        throw new Error('参数错误')
    }
    ctx.body = await usersDao.syncData({
        name: rbody.name,
        preview: rbody.json,
        type: 1,
    }, Number(ctx.query.uid))
}

export async function latestData(ctx: any) {
    if (!ctx.query.name || !ctx.query.uid) {
        throw new Error('参数错误')
    } 
    ctx.body = await usersDao.getLatest(ctx.query.name, Number(ctx.query.uid))
}