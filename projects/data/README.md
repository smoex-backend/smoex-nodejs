
POST:
common/sync
    req: { name: '', json: '' }
common/state
    req: { name: '', access?: 'private' }

-- has auth
users/sync
    req: { name: '', json: '' }

GET
common/lastest
    req: { name: '' }
    resp: { json: '' }
common/history
    req: { name: '' }
    resp: { list: [] }

-- has auth
users/lastest
    req: { name: '' }
    resp: { json: '' }
users/history
    req: { name: '' }
    resp: { list: [] }
