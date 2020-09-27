import { PassThrough } from 'stream'
import { Context, Next } from 'koa'

export const normalizeError = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch(error) {
        const { code = -1, message = 'unknow error', ...context } = error
        ctx.body = { code, data: { message } }
        if (Object.keys(context).length) {
            ctx.body.context = context
        }
    }
}

export const normalizeData = async (ctx: Context, next: Next) => {
    await next()
    // TODO: 寻求更好的判断方法 ing
    const isObject = typeof ctx.body === 'object' && !(ctx.body instanceof PassThrough)
    if (isObject && typeof ctx.body.code === 'undefined') {
        const data = JSON.parse(JSON.stringify(ctx.body))
        ctx.body = { code: 0, data }
    }
}