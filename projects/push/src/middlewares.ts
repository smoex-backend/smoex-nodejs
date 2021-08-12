import { revertRequestUrl } from '@jsk-aliyun/env'
import Koa from 'koa'

export async function configure(ctx: Koa.Context, next: Koa.Next) {
    ctx.url = revertRequestUrl(ctx.url)
    await next();
}
