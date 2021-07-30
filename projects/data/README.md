
### /data/shared

- GET: /data/shared/lastest
    - req: { name: '' }
    - resp: { json: '' }
- GET: /data/shared/history
    - req: { name: '' }
    - resp: { list: [] }

- POST: data/shared/sync
    - req: { name: '', json: '' }
- POST: data/shared/state
    - req: { name: '', access?: 'private' }

### /data/users

- GET: users/lastest
    - req: { name: '' }
    - resp: { json: '' }
- GET: users/history
    - req: { name: '' }
    - resp: { list: [] }

- POST: data/users/sync
    - req: { name: '', json: '' }
