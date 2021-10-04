import { authConfigs } from '@jsk-env/server'
import qs from 'qs'
import axios from 'axios'
const WECHAT_API = 'https://api.weixin.qq.com/sns'

type IWechatSession = {
    openid: string,
    session_key: string,
    unionid: string,
}

export async function checkcode(code: number, name?: string) {
    const conf = !name ? authConfigs.wechat : authConfigs.wechat?.[name]
    if (!conf) {
        throw new Error('auth 配置错误')
    }
    const body = {
        appid: conf.appId,
        secret: conf.appSecret,
        grant_type: 'authorization_code',
        js_code: code,
    }
    const res = await axios.get(`${WECHAT_API}/jscode2session?${qs.stringify(body)}`)
    return await res.data as IWechatSession
}

export function checkAppName(name: string) {
    return !!authConfigs.wechat?.[name]
}