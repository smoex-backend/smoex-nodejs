import mysql, { PoolConnection } from 'mysql'

const devHost = 'rm-uf6ptrnm757lc165vao.mysql.rds.aliyuncs.com'
const prodHost = 'rm-uf6ptrnm757lc165v125010.mysql.rds.aliyuncs.com'

const config = {
    database: process.env.MYSQL_DATABASE || 'smoex_learn_jp_word'
}

const pool = mysql.createPool({
    connectionLimit: 20, //连接池连接数
    host: (process.env.OSS_ENV === 'development' || process.env.NODE_ENV !== 'production') ? devHost : prodHost, //数据库地址，这里用的是本地
    database: config.database, //数据库名称
    user: 'smoex_root',  // username
    password: 'smoexxxxx', // password
    connectTimeout: 500,
    multipleStatements: true,
})

export type PoolConnectionProxy = {
    query: (sql: string, values?: any) => Promise<any> 
    beginTransaction: () => Promise<any>
    commit: () => Promise<any>
    rollback: () => Promise<any>
    release: () => void
}


//返回一个Promise链接
export const getConnection = () => new Promise<PoolConnectionProxy>((resolve, reject) => {
    pool.getConnection((err, conn) => {
        if(err) { reject(err); return }
        const proxy = createConnectionProxy(conn)
        resolve(proxy)
    })
})

function createConnectionProxy(conn: PoolConnection) {
    return {
        query: (sql: string, values?: any) => new Promise((resolve, reject) => {
            conn.query(sql, values, (err, rows) => err ? reject(err) : resolve(rows))
        }),
        beginTransaction: () => new Promise((resolve, reject) => {
            conn.beginTransaction(err => err ? reject(err) : resolve())
        }),
        commit: () => new Promise((resolve, reject) => {
            conn.commit(err => err ? reject(err) : resolve())
        }),
        release: conn.release,
        rollback: () => new Promise((resolve, reject) => {
            conn.rollback(err => err ? reject(err) : resolve())
        })
    }
}
