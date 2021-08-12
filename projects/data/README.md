
### /data/shared -- 公用数据

- GET: /data/shared
    - req: { name: '' }
    - resp: { json: '' }
- GET: /data/shared/history
    - req: { name: '' }
    - resp: { list: [] }

- POST: /data/shared/sync
    - req: { name: '', json: '' }
- POST: /data/shared/state
    - req: { name: '', access?: 'private' }

### /data/users -- 注册用户相关数据

- GET: /data/users
    - req: { name: '' }
    - resp: { json: '' }
- GET: /data/users/history
    - req: { name: '' }
    - resp: { list: [] }

- POST: /data/users/sync
    - req: { name: '', json: '' }

### /data/guest -- 未登录用户数据 (方案待定

- GET: /data/guest
    - req: { name: '' }
    - resp: { json: '' }

- GET: /data/users/history
    - req: { name: '' }
    - resp: { list: [] }

- POST: /data/users/sync
    - req: { name: '', json: '' }