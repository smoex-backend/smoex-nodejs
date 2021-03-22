import jwt from 'jsonwebtoken'

const slat = 'smoex-slat'

export function decodeToken(str: string) {
    const data = jwt.verify(str, slat) as any
    return JSON.parse(data.data)
}

export function encodeToken(data: any, expires: string | number = '7d') {
    return jwt.sign({ data: JSON.stringify(data) }, slat, {
        // algorithm: 'RS256',
        expiresIn: expires,
    })
} 