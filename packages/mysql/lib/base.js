"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = void 0;
const tslib_1 = require("tslib");
const mysql_1 = tslib_1.__importDefault(require("mysql"));
const devHost = 'rm-uf6ptrnm757lc165vao.mysql.rds.aliyuncs.com';
const prodHost = 'rm-uf6ptrnm757lc165v125010.mysql.rds.aliyuncs.com';
const pool = mysql_1.default.createPool({
    connectionLimit: 20,
    host: (process.env.OSS_ENV === 'development' || process.env.NODE_ENV !== 'production') ? devHost : prodHost,
    database: 'smoex_learn_jp_dataset',
    user: 'smoex_root',
    password: 'smoexxxxx',
    connectTimeout: 500,
});
//返回一个Promise链接
exports.getConnection = () => new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
        conn.beginTransaction;
        if (err) {
            reject(err);
        }
        const proxy = createConnectionProxy(conn);
        resolve(proxy);
    });
});
function createConnectionProxy(conn) {
    return {
        query: (sql, values) => new Promise((resolve, reject) => {
            conn.query(sql, values, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        }),
    };
}
