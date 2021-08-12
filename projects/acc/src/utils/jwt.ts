import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const slat = 'smoex-auth-slat'

export function decodeToken(str: string) {
    const data = jwt.verify(str, slat) as any
    return JSON.parse(data.data)
}

// jwt token 默认 30 天有效
export function encodeToken(data: any, expires: string | number = '30d') {
    return jwt.sign({ data: JSON.stringify(data) }, slat, {
        // algorithm: 'RS256',
        expiresIn: expires,
    })
}
export function randomCode() {
    let num = ''
    for (let i = 0; i < 6; i++) {
      num += Math.floor(Math.random() * 10)
    }
    return parseInt(num)
}

export function createUUID() {
    return uuidv4().replace(/-/g, '')
}