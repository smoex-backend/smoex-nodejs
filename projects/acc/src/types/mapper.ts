import {  createSampleDSL } from '@jsk-server/mysql'

export const USERS_DSL = createSampleDSL('users', [
    { name: 'id', type: 'primary' },
    { name: 'nickname', type: 'editable' },
    { name: 'avatar_url', type: 'editable' },
    { name: 'sign', type: 'editable' },
    { name: 'password', type: 'editable' },
    { name: 'cert_id', type: 'editable' },
])

export const USERS_AUTH_DSL = createSampleDSL('users_authization', [ 
    { name: 'id', type: 'primary' },
    { name: 'uid', type: 'editable' },
    { name: 'type', type: 'readonly' },
    { name: 'access_token', type: 'editable' },
    { name: 'extra', type: 'editable' },
])

export const USERS_VERI_DSL = createSampleDSL('users_verification', [ 
    { name: 'id', type: 'primary' },
    { name: 'uid', type: 'editable' },
    { name: 'type', type: 'readonly' },
    { name: 'target', type: 'editable' },
    { name: 'extra', type: 'editable' },
])
