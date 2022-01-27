import { RouterContext } from 'koa-router';
import { smsClients, resClients } from '@jsk-env/aliyun'
import fs from 'fs'

export async function upload(ctx: RouterContext) {
//   const file = ctx.request.file;
    // @ts-ignore
    const file: any = ctx.request.files.file
    const reader = fs.createReadStream(file.path);
    resClients['shared'].putStream(reader, String(Date.now()))
    // const req = ctx.req
    // let post = '';     
    // req.on('data', function(chunk){    
    //     post += chunk;
    // });
    // req.on('end', function(){
    //     resClients['shared'].putString(post, String(Date.now()) + '.gif')
    // })
    // resClients['shared'].putString(ctx.request.files.file)
//   console.log(123, ctx.request.body, ctx.req.on)
//   console.log(666, Object.keys(ctx.request), Object.keys(ctx.req))
  ctx.body = '上传成功'
}

export async function temp(ctx: RouterContext) {
    // ctx.header['content-type'] = 'html'
    ctx.body = `
        <html>
        <head>
            <script>
                function onUpload(e) {
                    const file = e.target.files[0]
                    const body = new FormData()
                    console.log(file)
                    body.append('file', file)
                    body.append('filename', 1234)
                    fetch('/file/users/upload', {
                        method: 'post',
                        headers: {
                        },
                        body
                    }).then(() => {
                        alert('上传成功')
                    })
                }
            </script>
        </head>
        <body>
            <form enctype="multipart/form-data">
                <input id="file" type="file" onchange="onUpload(event)" />
            </form>
        </body>
    </html>
    `
    ctx.type = 'html'
}
  