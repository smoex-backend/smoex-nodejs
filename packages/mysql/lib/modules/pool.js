"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = void 0;
const tslib_1 = require("tslib");
const mysql_1 = tslib_1.__importDefault(require("mysql"));
const devHost = 'rm-uf6ptrnm757lc165vao.mysql.rds.aliyuncs.com';
const prodHost = 'rm-uf6ptrnm757lc165v125010.mysql.rds.aliyuncs.com';
const config = {
    database: process.env.MYSQL_DATABASE || 'smoex_learn_jp_word'
};
const pool = mysql_1.default.createPool({
    connectionLimit: 20,
    host: (process.env.OSS_ENV === 'development' || process.env.NODE_ENV !== 'production') ? devHost : prodHost,
    database: config.database,
    user: 'smoex_root',
    password: 'smoexxxxx',
    connectTimeout: 500,
    multipleStatements: true,
});
//返回一个Promise链接
exports.getConnection = () => new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
        if (err) {
            reject(err);
            return;
        }
        const proxy = createConnectionProxy(conn);
        resolve(proxy);
    });
});
function createConnectionProxy(conn) {
    return {
        query: (sql, values) => new Promise((resolve, reject) => {
            conn.query(sql, values, (err, rows) => err ? reject(err) : resolve(rows));
        }),
        beginTransaction: () => new Promise((resolve, reject) => {
            conn.beginTransaction(err => err ? reject(err) : resolve());
        }),
        commit: () => new Promise((resolve, reject) => {
            conn.commit(err => err ? reject(err) : resolve());
        }),
        release: conn.release,
        rollback: () => new Promise((resolve, reject) => {
            conn.rollback(err => err ? reject(err) : resolve());
        })
    };
}
