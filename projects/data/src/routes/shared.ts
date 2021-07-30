import Router, { RouterContext } from 'koa-router'
import * as sharedDao from '../daos/shared' 

const ACCESS_MAP = {
    'private': 0,
    'public': 1,
    'latest': 2,
} as const

export async function syncData(ctx: any) {
    const rbody = ctx.request.body
    if (!rbody.name) {
        throw '参数错误'
    }
    ctx.body = await sharedDao.syncData({
        name: rbody.name,
        preview: rbody.json,
        type: 1,
    })
}

export async function latestData(ctx: RouterContext) {
    ctx.path
    if (!ctx.query.name) {
        throw '参数错误'
    } 
    ctx.body = await sharedDao.getLatest(ctx.query.name as string)
}