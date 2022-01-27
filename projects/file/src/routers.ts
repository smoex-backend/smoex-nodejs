import Router from 'koa-router'
import * as userRoutes from './routes/users'
import koabody from 'koa-body'
const file = koabody({
    multipart: true,  // 支持表单上传
    formidable: {
    maxFileSize: 100000 * 1024 * 1024, // 修改文件大小限制，默认位2M
    }
})
// users 相关 router
const usersRouter = new Router({ prefix: '/file/users'})
usersRouter.post('/upload', file, userRoutes.upload)// 获得最新版本数据
usersRouter.get('/temp', userRoutes.temp)// 获得最新版本数据

export default [
    usersRouter,
]