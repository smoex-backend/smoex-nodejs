## aliyun 网关层接口及资源总览

- fc api: smoex-nodejs-api.30036141340C // 网关 api 分发请求
    - host: api.smoex.com
    - /[fc-name]/* -> fc://[fc-name]/*
    - 详细接口文档: projects/[service-name]/README.md

- fc data : 'smoex-nodejs-data.62B8C90022D9' // 数据存储相关
    - GET: /data/users  -- 获取用户最新数据, auth: member
    - POST: /data/users/sync  -- 同步用户最新数据, auth: member
    - GET: /data/shared -- 获取最新共享数据
    - POST: /data/shared/sync  -- 同步最新共享数据, auth: staff
    - POST: /data/shared/state  -- 更新共享数据状态, auth: staff

- fc auth : 'smoex-nodejs-auth.CFBF5827F9D8' // 鉴权相关, 包括不仅限于用户鉴权
    - GET: /auth/users/token -- 获取用户鉴权基本信息 auth: internal
    - POST: /auth/users/sendcode -- 推送验证码 -- auth: internal
    - POST: /auth/users/checkcode - 校验验证码 -- auth: internal
    - POST: /auth/users/thirdparty - 第三方鉴权登录 -- auth: internal

- fc acc : 'smoex-nodejs-acc.CFF873FA4611' // 用户账号系统及安全相关
    - GET: /acc/info -- 用户基本信息, 附赠 /auth/token 效果
    - POST: /acc/login -- 用户登录, 账号/验证码 -- auth: guest (暂缺)
    - GET: /acc/logout -- 用户退出
    - POST: /acc/auth/login -- 鉴权后登录
    - POST: /acc/auth/regist -- 鉴权登录若失败, 则需要注册
    - GET[PROXY]: /acc/auth/token -- 不需要展示用户基本信息时进行用户鉴权
    - POST[PROXY]: /acc/auth/sendcode -- 发送验证码 -- auth: guest/member
    - POST[PROXY]: /acc/auth/checkcode -- 校验验证码 -- auth: guest/member
    - POST[PROXY]: /acc/auth/thirdparty -- 第三方鉴权登录 -- auth: guest/member

- fc push : 'smoex-nodejs-push.7B7CB2D85356' // 推送相关, email/手机短信 及其他推送
    - POST: /push/sms/sendcode -- 发送手机短信 -- auth: internal

- fc file : 'smoex-nodejs__.62B8C90022D9' // 文件存储相关
    - 暂缺
