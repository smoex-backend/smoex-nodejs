import mysql from 'mysql'

// 这个文件写的像**一样
const insertExtras = {
    // createdTime: 'now()',
    // updatedTime: 'now()',
  }
  
  type ISQLOptions = {
    name: string,
    mapper: any,
    model?: any,
    query?: any,
    extras?: any,
  }
  
  export const createInsertSql = (options: ISQLOptions) => {
    const {
      name, 
      model = {}, 
      mapper = [], 
      extras = insertExtras
    } = options
  
    const [columns, values] = getNotNullValues(model, mapper, true)
    if (columns.length === 0) {
      return ''
    }

    const [extraColumns, extraValues] = getNotNullValues(extras, mapper)
    const insertColumns = columns.concat(extraColumns)
    const insertPlaceHolders = insertColumns.map(() => '??').join(', ')
    const insertValuePlaceHolders = columns.map(() => '?').join(', ')
    const extrasValuePlaceHolders = extraValues.length ? ', ' + extraValues.join(', ') : ''
    const insertValuesSql = `VALUES(${insertValuePlaceHolders}${extrasValuePlaceHolders})`
    const insertSql = `INSERT INTO ??(${insertPlaceHolders}) ${insertValuesSql}` 
    return mysql.format(insertSql, [name].concat(insertColumns).concat(values))
  }
  
  export const createSelectSql = (options: ISQLOptions) => {
    const {
      name, 
      mapper = [], 
    } = options
  
    if (mapper.length === 0) {
      return ''
    }
    const mergedValues = [] as any[]
    for (const map of mapper) {
      if (map.column) {
        mergedValues.push(map.column)
      }
      mergedValues.push(map.name)
    }
    const selectColumns = mapper.concat([])
    const selectPlaceHolders = selectColumns.map((x: any) => x.column ? '?? as ??' : '??').join(', ')
    const selectSql = `SELECT SQL_CALC_FOUND_ROWS ${selectPlaceHolders} FROM ??`
    return mysql.format(selectSql, mergedValues.concat([name]))
  }
  
  const updateExtras = {
    // updatedTime: 'now()',
  }
  
 export const createUpdateSql = (options: ISQLOptions) => {
    const {
      name, 
      model = {}, 
      mapper = [], 
      extras = updateExtras
    } = options
    const [columns, _, mergedValues] = getNotNullValues(model, mapper, true)
    if (columns.length === 0) {
      return ''
    }
    const [extraColumns, extrasValues] = getNotNullValues(extras, mapper)
    const updateColumns = columns.concat([])
    const updatePlaceHolders = updateColumns.map(() => '??=?').concat(extrasValues.map(value => `??=${value}`)).join(', ')
    const updateSql = `UPDATE ?? SET ${updatePlaceHolders}`
    return mysql.format(updateSql, [name].concat(mergedValues).concat(extraColumns))
  }
  
  export const createWhereSql = (query: any = {}, mapper: any = [], join: string = 'AND') => {
    const [columns, values, mergedValues] = getNotNullValues(query, mapper)
    if (columns.length === 0) {
      return ''
    }
    const whereColumns = values.concat([])
    const wherePlaceHolders = whereColumns.map(x => Array.isArray(x) ? `?? IN (${x.map(() => '?')})` :'??=?').join(` ${join} `)
    const whereSql = `WHERE ??=0 AND ${wherePlaceHolders}`
    return mysql.format(whereSql, ['is_deleted'].concat(mergedValues))
  }

  export const createOrderSql = (order: string, mapper: any[] = []) => {
    if (!order) {
      return ''
    }
    const [ name, type ] = order.split('\.')
    const map = mapper.find(x => x.name === name)
    const orderType = type.toUpperCase()
    if (!map || !name || !['asc', 'desc'].includes(orderType)) {
      return ''
    }
    const orderSql = `ORDER BY ?? ${orderType}`
    return mysql.format(orderSql, [name])
  }
  
  const getNotNullValues = (model: any = {}, mapper: any[], editable = false) => {
    const columns = [] as any[]
    const values = [] as any[]
    const mergedValues = [] as any[]
    const reverise = [] as any[]
  
    const pushData = (column: any, value: any) => {
      columns.push(column)
      values.push(value)
      mergedValues.push(column)
      if (Array.isArray(value)) {
        mergedValues.push(...value)
      } else {
        mergedValues.push(value)
      }
    }

    for (const column of Object.keys(model)) {
      const value = model[column]
      if (value === null || value === undefined) {
        continue
      }
      const map = mapper.find(x => x.name === column)
      if (editable && map && !map.editable) {
        continue
      }
      if (map && map.column) {
        pushData(map.column, value)
        continue
      }
      pushData(column, value)
    }
    return [columns, values, mergedValues, reverise]
  }