import { RouterContext } from 'koa-router'
import * as usersDao from '../daos/users'

export async function syncData(ctx: RouterContext) {
    const params = ctx.jsk.params([
        { name: 'name', type: 'string' },
        { name: 'json', type: 'string' },
    ])

    if (!params.json || !params.name) {
        throw new Error('参数错误')
    }

    // @ts-ignore
    const { user } = ctx.auth.token
    if (!user) {
        throw new Error('用户未登录')
    }

    const body = {
        name: params.name,
        preview: params.json,
        type: 1,
    }
    ctx.body = await usersDao.syncData(body, user.uid) || {}
}

export async function latestData(ctx: RouterContext) {
    const params = ctx.jsk.params([
        { name: 'name', type: 'string' },
    ])
    if (!params.name) {
        throw new Error('参数错误')
    }
    // @ts-ignore
    const { user } = ctx.auth.token
    if (!user) {
        throw new Error('用户未登录')
    }

    ctx.body = await usersDao.getLatest(params.name, user.uid) || {}
}