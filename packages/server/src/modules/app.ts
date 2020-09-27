import Koa from 'koa'
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'

const app = new Koa()

// error handler
// onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json({ pretty: false }))
app.use(logger())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = +new Date() - +start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// error-handling
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx)
// });

export default app
