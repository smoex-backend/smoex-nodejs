
### /acc

- POST: /acc/login
    - req: { account: '', password: '' }
    - req-- 优先处理 code, 字段, 如果存在 code 则忽略 account 和 password, 否则进行联合登录
- GET: /acc/logout -- 自动写入 cookie, 无需任何处理
- GET: /acc/info
    - resp: {}


### /acc/auth -- 用户鉴权通过后调用

- GET: /acc/auth/login -- 使用当前鉴权信息登录
- POST: /acc/auth/regist -- 填写昵称后即注册完成
    - req: { nickname: '',  avatar: '' }

### PROXY /acc/auth --> /auth/users
- GET: /acc/auth/token
- POST: /acc/auth/sendcode
- POST: /acc/auth/checkcode
- POST: /acc/auth/thirdparty

## 其它说明
用户鉴权登录(通过) -> 查询鉴权信息(不存在) -> 获取用户 profile -> 写入 profile, 获取 uid -> 写入鉴权信息

手机/邮箱登录
sendcode -> checkcode -> login(failure) -> regist -> success
sendcode -> checkcode -> login(success)
鉴权登录注册
checkcode -> login(failure) -> regist -> success
checkcode -> login(success)
