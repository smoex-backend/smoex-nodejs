## aliyun 网关层接口及资源总览

- fc api: smoex-nodejs-api.30036141340C // 网关 api 分发请求
    - host: api.smoex.com
    - /[fc-name]/* -> fc://[fc-name]/*
    - 详细接口文档: projects/[service-name]/README.md

- fc data : 'smoex-nodejs__config.62B8C90022D9' // 数据存储相关
    - GET: /data/users/latest  -- 获取用户最新数据, auth: member
    - POST: /data/users/sync  -- 同步用户最新数据, auth: member
    - GET: /data/shared/latest -- 获取最新共享数据
    - POST: /data/shared/sync  -- 同步最新共享数据, auth: staff
    - POST: /data/shared/state  -- 更新共享数据状态, auth: staff

- fc auth : 'smoex-nodejs-auth.62B8C90022D9' // 鉴权相关, 包括不仅限于用户鉴权
    - GET: /auth/users/token -- 获取用户鉴权基本信息 auth: internal
    - POST: /auth/users/sendcode -- 推送验证码 -- auth: internal
    - POST: /auth/users/checkcode - 校验验证码 -- auth: internal

- fc acc : 'smoex-nodejs-acc.62B8C90022D9' // 用户账号系统及安全相关
    - GET: /acc/info -- 用户基本信息
    - GET: /acc/logout -- 用户退出
    - POST: /acc/login -- 用户登录, 账号/验证码 -- auth: guest
    - POST: /acc/modify -- 用户信息修改 -- auth: member
    - POST: /acc/sendcode -- 发送验证码 -- auth: guest/member
    - POST: /acc/checkcode -- 校验验证码 -- auth: guest/member

- fc push : 'smoex-nodejs-push.7B2EC857050B' // 推送相关, email/手机短信 及其他推送
    - POST: /push/sms/send -- 发送手机短信 -- auth: internal

- fc file : 'smoex-nodejs__.62B8C90022D9' // 文件存储相关
    - 暂无
