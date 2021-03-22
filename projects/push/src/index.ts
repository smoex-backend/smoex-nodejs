import { listenServer } from '@node-kits/koa'
import { createAPIServer  } from '@node-kits/aliyun'
import smsRouter from "./routes/sms";

const routers = [smsRouter]
const app = createAPIServer(routers)

listenServer(app)