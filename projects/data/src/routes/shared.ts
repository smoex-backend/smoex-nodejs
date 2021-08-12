import { RouterContext } from 'koa-router'
import * as sharedDao from '../daos/shared' 

export async function syncData(ctx: RouterContext) {
    const params = ctx.jsk.params([
        { name: 'name', type: 'string' },
        { name: 'json', type: 'string' },
    ])

    if (!params.json || !params.name) {
        throw new Error('参数错误')
    }

    ctx.body = await sharedDao.syncData({
        name: params.name,
        preview: params.json,
        type: 1,
    })
}

export async function latestData(ctx: RouterContext) {
    const params = ctx.jsk.params([
        { name: 'name', type: 'string' },
    ])

    if (!params.name) {
        throw new Error('参数错误')
    }

    ctx.body = await sharedDao.getLatest(params.name)
}