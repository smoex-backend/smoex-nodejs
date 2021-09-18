import { mysqlClients } from '@jsk-aliyun/env'
import { connectDSL, startTransation } from '@jsk-server/mysql'
import { USERS_DSL, USERS_AUTH_DSL, USERS_VERI_DSL } from '../types/mapper'

export async function saveAndBindAccessToken(data: any) {
    const conn = await mysqlClients['users'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const execAuth = connectDSL(conn, USERS_AUTH_DSL)

    const { type, extra, access_token, ...userInfo } = data

    if (!access_token) {
        throw new Error('Not Exists access_token')
    }

    return await startTransation(conn, async () => {
        const res = await exec`INSERT ${userInfo}`
        const uid = res.result.insertId
        await execAuth`INSERT ${{ type, access_token, extra: JSON.stringify(extra), uid }}`
        return { ...userInfo, uid }
    })

}

export async function saveAndBindVerification(data: any) {
    const conn = await mysqlClients['users'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const execVeri = connectDSL(conn, USERS_VERI_DSL)

    let { type, target, ...userInfo } = data
    // 手机号自动补区号
    if (type === 1 && !target.startsWith('+')) {
        target = '+86' + target
    }

    return await startTransation(conn, async () => {
        const res = await exec`INSERT ${userInfo}`
        const uid = res.result.insertId
        await execVeri`INSERT ${{ type, target, uid }}`
        return { ...userInfo, uid }
    })
} 

export async function getByAccessToken(token: string, type: number) {
    const conn = await mysqlClients['users'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const execAuth = connectDSL(conn, USERS_AUTH_DSL)
    const authRes = await execAuth`SELECT WHERE ${{ access_token: token, type }}`
    if (!authRes.firstRow) {
        return
    }
    const uid = authRes.firstRow.uid
    const res = await exec`SELECT [nickname, avatar_url, sign] WHERE ${{ id: uid }}`
    return res.firstRow && { ...res.firstRow, uid }
}

export async function getByVerification(target: string, type: number) {
    const conn = await mysqlClients['users'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const execVeri = connectDSL(conn, USERS_VERI_DSL)
    // 手机号自动补区号
    if (type === 1 && !target.startsWith('+')) {
        target = '+86' + target
    }
    const veriRes = await execVeri`SELECT WHERE ${{ target, type }}`
    if (!veriRes.firstRow) {
        return
    }
    const uid = veriRes.firstRow.uid
    const res = await exec`SELECT [nickname, avatar_url, sign] WHERE ${{ id: uid }}`
    return res.firstRow && { ...res.firstRow, uid }
} 