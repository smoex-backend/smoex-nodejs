export * from './normalize'
export * from './proxy'
export * from './vaildate'

import { Context, Next } from 'koa'

export const initialize = async (ctx: Context, next: Next) => {
    ctx.config = {}
    await next()
 }
 
export const staticRemote = (remotePaths: any[] = []) => async (ctx: Context, next: Next) => {
    //  const { remotePaths = [] } = ctx.config
     const ua = ctx.header['user-agent']
     const isMobile = /AppleWebKit.*Mobile.*/i.test(ua)

     const remoteMap = {} as any

     for (const remote of remotePaths) {
         remoteMap[remote.route][remote.device || 'web'] = remote.path
     }

     ctx.config.staticPath = (isMobile && remoteMap["/"].mobile) || remoteMap["/"].web
  
     for (const path of Object.keys(remoteMap)) {
         const map = remoteMap[path]
         if (path !== '/' && ctx.url.startsWith(path)) {
            ctx.config.staticPath = (isMobile && map.mobile) || map.web
         }
     }
     await next()
 }