import { mysqlClients, resClients } from '@jsk-aliyun/env'
import { startTransation, connectDSL } from '@jsk-server/mysql'
import { SHARED_DSL, SHARED_HISTORY_DSL } from '../types/mapper'
import { createTimePath } from '../utils'

export const syncData = async (data: Partial<any>) => {
    // 存储静态文件
    const sharedRes = resClients['shared']
    const resp = await sharedRes.putString(data.preview!, `${createTimePath()}.json`)
    data.stable_url = resp.public_url

    // 链接数据库
    const conn = await mysqlClients['data'].getConnection()
    const exec = connectDSL(conn, SHARED_DSL)
    const execHistory = connectDSL(conn, SHARED_HISTORY_DSL)
    
    // 开启事物
    return await startTransation(conn, async () => {
        const { firstRow } = await exec`SELECT WHERE ${{ name: data.name }} LIMIT 1`
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

export async function getLatest(name: string) {
    const conn = await mysqlClients['data'].getConnection()
    const exec = connectDSL(conn, SHARED_DSL)
    const res = await exec`SELECT [preview] WHERE ${{ name }} LIMIT 1`
    return res.firstRow
}
