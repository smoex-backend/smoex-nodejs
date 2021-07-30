import { mysqlClients, resClients, aliyunConfigs } from '@jsk-aliyun/env'
import mysql, { ResultSetHeader } from 'mysql2/promise'
import { DataRow, DataModel, USERS_DSL, USERS_HISTORY_DSL, BaseHistoryModel } from '../types/mapper'
import { PassThrough } from 'stream'

export function createTimePath() {
    const now = (new Date()).toISOString()
        .replace(/-/g, '')
        .replace(/\//g, '')
        .replace(/:/g, '')
        .replace(/\./g, '_')
    return `/${now.split('T')[0]}/${now.replace('T', '_')}`
}

export const syncData = async (data: Partial<DataModel>, uid: number) => {
    // 存储静态文件
    const usersRes = resClients['users']
    const resp = await usersRes.putString(data.preview!, `${createTimePath()}.json`)
    data.stable_url = resp.public_url
    data.uid = uid
    // 开启存储事物
    return await startTransation(mysqlClients['data'], async conn => {
        const existSql = USERS_DSL`SELECT WHERE ${{ name: data.name, uid }} LIMIT 1`
        const [[ rowData ]] = await conn.query<DataRow>(existSql)

        const historyData = { ...data } as Partial<BaseHistoryModel>
        if (rowData) {
            const updateSql = USERS_DSL`UPDATE ${data} WHERE ${{ id: rowData.id }}`
            await conn.query<ResultSetHeader>(updateSql)
            historyData.rid = rowData.id
        } else {
            const insertSql = USERS_DSL`INSERT ${data}`
            const [{ insertId }] = await conn.query<ResultSetHeader>(insertSql)
            historyData.rid = insertId
        }

        const insertHistorySql = USERS_HISTORY_DSL`INSERT ${historyData}`

        await conn.query(insertHistorySql)
        return { message: 'ok' }
    })
}

export async function getLatest(name: string, uid: number) {
    const conn = await mysqlClients['data'].getConnection()
    const selectSql = USERS_DSL`SELECT INC[preview,stable_url] WHERE ${{ name, uid }} LIMIT 1`
    const [[ rowData ]] = await conn.query<DataRow>(selectSql)
    return { 
        url: rowData?.stable_url,
        json: rowData?.preview,
    }
}

type ITransationCallback<T> = (conn: mysql.PoolConnection) => Promise<T>

export async function startTransation<T>(pool: mysql.Pool, callback: ITransationCallback<T>) {
    const conn = await pool.getConnection()
    let res: T
    try {
        await conn.beginTransaction()
        res = await callback(conn)
        await conn.commit()
    } catch (e) {
        await conn?.rollback()
        throw e
    } finally {
        conn?.release()
    }
    return res
}
