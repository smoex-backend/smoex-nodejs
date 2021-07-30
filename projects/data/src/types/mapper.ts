import {  createSampleDSL } from '@jsk-server/mysql'
import { RowDataPacket } from 'mysql2'

export type IRowData<T> = RowDataPacket[] & T[]
export type IRowDataTotal<T> = [IRowData<T>, IRowData<{ total: number }>] 

export type DataModel = {
    id: number;
    name: string,
    preview: string,
    stable_url: string,
    type: number,
    access?: number,
    uid?: number,
}

export type BaseHistoryModel = {
    id: number;
    rid: number,
    stable_url: string,
}

export type DataRow = IRowData<DataModel>
export type HistoryRow = IRowData<BaseHistoryModel>

export const COMMON_DSL = createSampleDSL('common_data', [
    { name: 'id', primary: true },
    { name: 'name' },
    { name: 'preview' },
    { name: 'stable_url' },
    { name: 'access', editable: true },
    { name: 'type' },
])

export const COMMON_HISTORY_DSL = createSampleDSL('common_history', [
    { name: 'id', primary: true },
    { name: 'rid' },
    { name: 'stable_url' },
])

export const USERS_DSL = createSampleDSL('users_data', [
    { name: 'id', primary: true },
    { name: 'uid' },
    { name: 'name' },
    { name: 'preview' },
    { name: 'stable_url' },
    { name: 'type' },
])

export const USERS_HISTORY_DSL = createSampleDSL('users_history', [
    { name: 'id', primary: true },
    { name: 'rid' },
    { name: 'stable_url' },
])