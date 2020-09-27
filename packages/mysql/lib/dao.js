"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDao = exports.BaseSql = void 0;
const tslib_1 = require("tslib");
const test_1 = require("../temp/dao/test");
const sql_1 = require("./sql");
const mysql_1 = tslib_1.__importDefault(require("mysql"));
class BaseSql {
    constructor(name, mapper) {
        this.name = name;
        this.mapper = mapper;
    }
    createWhereSql(query) {
        return sql_1.createWhereSql(query, this.mapper);
    }
    createOrderSql(order) {
        return sql_1.createOrderSql(order, this.mapper);
    }
    createInsertSql(model) {
        return sql_1.createInsertSql({
            model,
            name: this.name,
            mapper: this.mapper,
        });
    }
    createUpdateSql(model, query) {
        const updateSql = sql_1.createUpdateSql({
            model,
            name: this.name,
            mapper: this.mapper,
        });
        const whereSql = sql_1.createWhereSql(query, this.mapper);
        return `${updateSql} ${whereSql}`;
    }
    createSelectSql(query = {}) {
        const selectSql = sql_1.createSelectSql({
            name: this.name,
            mapper: this.mapper,
        });
        const whereSql = sql_1.createWhereSql(query, this.mapper);
        return `${selectSql} ${whereSql}`;
    }
}
exports.BaseSql = BaseSql;
const BASE_ROWS_MAPPER = [
    { name: 'id' },
];
class BaseDao extends BaseSql {
    constructor(name, mapper) {
        super(name, [...mapper, ...BASE_ROWS_MAPPER]);
    }
    getConnection() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                this.connection = yield test_1.getConnection();
            }
            return this.connection;
        });
    }
    getById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return undefined;
            }
            const conn = yield this.getConnection();
            const sql = this.createSelectSql({ id });
            const rows = yield conn.query(`${sql} LIMIT 1`);
            return rows[0];
        });
    }
    getByQuery(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createSelectSql(query);
            const rows = yield conn.query(`${sql} LIMIT 1`);
            return rows[0];
        });
    }
    findByIds(ids) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createSelectSql({ id: ids });
            const rows = yield conn.query(`${sql} LIMIT 50`);
            return rows;
        });
    }
    findByQuery(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createSelectSql(query);
            const rows = yield conn.query(`${sql} LIMIT 50`);
            return rows;
        });
    }
    findByPageQuery(pageQuery) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.findAll(undefined, pageQuery);
        });
    }
    findAll(query, pageQuery) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            let pageSql = 'LIMIT 50';
            if (pageQuery) {
                const { page, size, order = '' } = pageQuery;
                if (page < 1) {
                    throw { message: 'pagination page must > 0' };
                }
                if (size < 1) {
                    throw { message: 'pagination size must > 0' };
                }
                const limitSql = mysql_1.default.format(`LIMIT ?, ?`, [page - 1, size]);
                pageSql = `${this.createOrderSql(order)} ${limitSql}`;
            }
            const totalSql = 'SELECT FOUND_ROWS() as `total`';
            const sql = this.createSelectSql(query);
            const rows = yield conn.query(`${sql} ${pageSql}; ${totalSql}`);
            const total = rows[1][0].total;
            const list = rows[0];
            return { list, total };
        });
    }
    create(model) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createInsertSql(model);
            const rows = yield conn.query(sql);
            return rows.insertId;
        });
    }
    update(model, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createUpdateSql(model, query);
            const rows = yield conn.query(sql);
            return rows.affectedRows;
        });
    }
    updateById(model, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.update(model, { id });
        });
    }
    delete(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createUpdateSql({ isDeleted: true }, query);
            const rows = yield conn.query(sql);
            return rows.affectedRows;
        });
    }
    deleteById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.delete({ id });
        });
    }
    deleteReal(query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const conn = yield this.getConnection();
            const sql = this.createUpdateSql({ idDeleted: true }, query);
            yield conn.query(sql);
        });
    }
    deleteRealById(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.deleteReal({ id });
        });
    }
}
exports.BaseDao = BaseDao;
