import Router, { RouterContext } from 'koa-router'
const router = new Router({ prefix: '/data/common' })
export default router

import * as commonDao from '../daos/common' 

// 同步数据
router.post('/sync', _syncData)
// 获得最新版本数据
router.get('/latest', _latestData)

const ACCESS_MAP = {
    'private': 0,
    'public': 1,
    'latest': 2,
} as const

async function _syncData(ctx: any) {
    const rbody = ctx.request.body
    if (!rbody.name) {
        throw '参数错误'
    }
    ctx.body = await commonDao.syncData({
        name: rbody.name,
        preview: rbody.json,
        type: 1,
    })
}

async function _latestData(ctx: RouterContext) {
    ctx.path
    if (!ctx.query.name) {
        throw '参数错误'
    } 
    ctx.body = await commonDao.getLatest(ctx.query.name as string)
}