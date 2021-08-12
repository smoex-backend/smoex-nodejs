### /push/sms -- 短消息推送

- POST: /push/sms/sendcode
    - req: { phone: '', code: 0, template: '' }
    - req --template: 验证码模版, 默认 checkcode