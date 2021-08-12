import {  createSampleDSL } from '@jsk-server/mysql'

export type DataModel = {
    id: number;
    name: string,
    preview: string,
    stable_url: string,
    type: number,
    access?: number,
    uid?: number,
}

// export type BaseHistoryModel = {
//     id: number;
//     rid: number,
//     stable_url: string,
// }


export const SHARED_DSL = createSampleDSL('common_data', [
    { name: 'id', type: 'primary' },
    { name: 'name', type: 'readonly' },
    { name: 'preview', type: 'editable' },
    { name: 'stable_url', type: 'editable' },
    { name: 'access', type: 'editable' },
    { name: 'type', type: 'editable' },
])

export const SHARED_HISTORY_DSL = createSampleDSL('common_history', [
    { name: 'id', type: 'primary' },
    { name: 'rid' , type: 'readonly' },
    { name: 'stable_url' , type: 'readonly' },
])

export const USERS_DSL = createSampleDSL('users_data', [
    { name: 'id', type: 'primary' },
    { name: 'uid', type: 'readonly' },
    { name: 'name' , type: 'readonly' },
    { name: 'preview' , type: 'editable' },
    { name: 'stable_url' , type: 'editable' },
    { name: 'type' , type: 'editable' },
])

export const USERS_HISTORY_DSL = createSampleDSL('users_history', [
    { name: 'id', type: 'primary' },
    { name: 'rid' , type: 'readonly' },
    { name: 'stable_url' , type: 'readonly' },
])

export const GUEST_DSL = createSampleDSL('guest_data', [
    { name: 'id', type: 'primary' },
    { name: 'token', type: 'readonly' },
    { name: 'name' , type: 'readonly' },
    { name: 'preview' , type: 'editable' },
    { name: 'stable_url' , type: 'editable' },
    { name: 'type' , type: 'editable' },
])

export const GUSET_HISTORY_DSL = createSampleDSL('guest_history', [
    { name: 'id', type: 'primary' },
    { name: 'rel_id' , type: 'readonly' },
    { name: 'stable_url' , type: 'readonly' },
])