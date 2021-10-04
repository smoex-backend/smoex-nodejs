import { mysqlClients, resClients } from '@jsk-env/aliyun'
import { connectDSL, startTransation } from '@jsk-server/mysql'
import {  USERS_DSL, USERS_HISTORY_DSL } from '../types/mapper'
import { createTimePath } from '../utils'

export const syncData = async (data: any, uid: number) => {
    // 存储静态文件
    const usersRes = resClients['users']
    const resp = await usersRes.putString(data.preview!, `${createTimePath()}.json`)
    data.stable_url = resp.public_url
    data.uid = uid

    const conn = await mysqlClients['data'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const execHistory = connectDSL(conn, USERS_HISTORY_DSL)

    // 开启存储事物
    return await startTransation(conn, async () => {
        const { firstRow } = await exec`SELECT WHERE ${{ name: data.name, uid }} LIMIT 1`
        const historyData = { ...data } as Partial<any>

        if (firstRow) {
            await exec`UPDATE ${data} WHERE ${{ id: firstRow.id }}`
            historyData.rid = firstRow.id
        } else {
            const { result } = await exec`INSERT ${data}`
            historyData.rid = result.insertId
        }

        await execHistory`INSERT ${historyData}`
        return { message: 'ok' }
    })
}

export async function getLatest(name: string, uid: number) {
    const conn = await mysqlClients['data'].getConnection()
    const exec = connectDSL(conn, USERS_DSL)
    const res = await exec`SELECT [preview] WHERE ${{ name, uid }} LIMIT 1`
    return res.firstRow
}
