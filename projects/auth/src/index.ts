import { listenServer } from '@node-kits/koa'
import { createAPIServer  } from '@node-kits/aliyun'
import verifyRouter from "./routes/verify";

const routers = [verifyRouter]
const app = createAPIServer(routers)

listenServer(app)