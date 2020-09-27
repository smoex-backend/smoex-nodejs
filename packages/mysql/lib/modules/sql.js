"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSql = exports.createWhereSql = exports.createUpdateSql = exports.createSelectSql = exports.createInsertSql = void 0;
const tslib_1 = require("tslib");
const mysql_1 = tslib_1.__importDefault(require("mysql"));
// 这个文件写的像**一样
const insertExtras = {
// createdTime: 'now()',
// updatedTime: 'now()',
};
exports.createInsertSql = (options) => {
    const { name, model = {}, mapper = [], extras = insertExtras } = options;
    const [columns, values] = getNotNullValues(model, mapper, true);
    if (columns.length === 0) {
        return '';
    }
    const [extraColumns, extraValues] = getNotNullValues(extras, mapper);
    const insertColumns = columns.concat(extraColumns);
    const insertPlaceHolders = insertColumns.map(() => '??').join(', ');
    const insertValuePlaceHolders = columns.map(() => '?').join(', ');
    const extrasValuePlaceHolders = extraValues.length ? ', ' + extraValues.join(', ') : '';
    const insertValuesSql = `VALUES(${insertValuePlaceHolders}${extrasValuePlaceHolders})`;
    const insertSql = `INSERT INTO ??(${insertPlaceHolders}) ${insertValuesSql}`;
    return mysql_1.default.format(insertSql, [name].concat(insertColumns).concat(values));
};
exports.createSelectSql = (options) => {
    const { name, mapper = [], } = options;
    if (mapper.length === 0) {
        return '';
    }
    const mergedValues = [];
    for (const map of mapper) {
        if (map.column) {
            mergedValues.push(map.column);
        }
        mergedValues.push(map.name);
    }
    const selectColumns = mapper.concat([]);
    const selectPlaceHolders = selectColumns.map((x) => x.column ? '?? as ??' : '??').join(', ');
    const selectSql = `SELECT SQL_CALC_FOUND_ROWS ${selectPlaceHolders} FROM ??`;
    return mysql_1.default.format(selectSql, mergedValues.concat([name]));
};
const updateExtras = {
// updatedTime: 'now()',
};
exports.createUpdateSql = (options) => {
    const { name, model = {}, mapper = [], extras = updateExtras } = options;
    const [columns, _, mergedValues] = getNotNullValues(model, mapper, true);
    if (columns.length === 0) {
        return '';
    }
    const [extraColumns, extrasValues] = getNotNullValues(extras, mapper);
    const updateColumns = columns.concat([]);
    const updatePlaceHolders = updateColumns.map(() => '??=?').concat(extrasValues.map(value => `??=${value}`)).join(', ');
    const updateSql = `UPDATE ?? SET ${updatePlaceHolders}`;
    return mysql_1.default.format(updateSql, [name].concat(mergedValues).concat(extraColumns));
};
exports.createWhereSql = (query = {}, mapper = [], join = 'AND') => {
    const [columns, values, mergedValues] = getNotNullValues(query, mapper);
    if (columns.length === 0) {
        return '';
    }
    const whereColumns = values.concat([]);
    const wherePlaceHolders = whereColumns.map(x => Array.isArray(x) ? `?? IN (${x.map(() => '?')})` : '??=?').join(` ${join} `);
    const whereSql = `WHERE ??=0 AND ${wherePlaceHolders}`;
    return mysql_1.default.format(whereSql, ['is_deleted'].concat(mergedValues));
};
exports.createOrderSql = (order, mapper = []) => {
    if (!order) {
        return '';
    }
    const [name, type] = order.split('\.');
    const map = mapper.find(x => x.name === name);
    const orderType = type.toUpperCase();
    if (!map || !name || !['asc', 'desc'].includes(orderType)) {
        return '';
    }
    const orderSql = `ORDER BY ?? ${orderType}`;
    return mysql_1.default.format(orderSql, [name]);
};
const getNotNullValues = (model = {}, mapper, editable = false) => {
    const columns = [];
    const values = [];
    const mergedValues = [];
    const reverise = [];
    const pushData = (column, value) => {
        columns.push(column);
        values.push(value);
        mergedValues.push(column);
        if (Array.isArray(value)) {
            mergedValues.push(...value);
        }
        else {
            mergedValues.push(value);
        }
    };
    for (const column of Object.keys(model)) {
        const value = model[column];
        if (value === null || value === undefined) {
            continue;
        }
        const map = mapper.find(x => x.name === column);
        if (editable && map && !map.editable) {
            continue;
        }
        if (map && map.column) {
            pushData(map.column, value);
            continue;
        }
        pushData(column, value);
    }
    return [columns, values, mergedValues, reverise];
};
