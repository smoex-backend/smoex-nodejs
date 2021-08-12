import jwt from 'jsonwebtoken'

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
