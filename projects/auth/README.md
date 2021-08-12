
### /users

- GET: /auth/users/token -- 自动写入 cookie, 延长 token 有效期, 无需任何处理

- POST: /auth/users/sendcode
    - req: { target: '', scope: '' }
    - req --scope: 当前 scope, checkcode 后被使用

- POST: /auth/users/checkcode -- 验证成功后, 写入 session -- `[access${sent.scope}]${uuid}`, 默认有效期 10min
    - req: { code: 0 }

- POST: /auth/users/thirdparty
    - req: { code: '', target: '', type: '' }
    - req --type: wechat
    - req --target: app name from auth config