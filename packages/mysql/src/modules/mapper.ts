import { PoolConnectionProxy, getConnection } from './pool'
import { 
    createUpdateSql, 
    createInsertSql, 
    createSelectSql,
    createWhereSql,
    createOrderSql,
} from './sql'
import mysql from 'mysql'

export type IBaseSqls = {
    select?: string,
}

export type IPaginationQuery = {
    page?: number,
    size?: number,
    order?: string | string[], // [name].asc/[name].desc
}

export type IPaginationRes = {
    page: number,
    size: number,
    total: number,
    hasmore: boolean,
    maxpage: number,
}


export abstract class BaseSql {
    protected name: string
    protected mapper: any

    constructor(name: string, mapper: any) {
        this.name = name
        this.mapper = mapper
    }

    protected createWhereSql(query: any) {
        return createWhereSql(query, this.mapper)
    }
    protected createOrderSql(order: string) {
        return createOrderSql(order, this.mapper)
    }
    protected createInsertSql(model: any) {
        return createInsertSql({ 
            model,
            name: this.name,
            mapper: this.mapper,
        })
    }
    protected createUpdateSql(model: any, query: any) {
        const updateSql = createUpdateSql({
            model,
            name: this.name,
            mapper: this.mapper,
        })
        const whereSql = createWhereSql(query, this.mapper)
        return `${updateSql} ${whereSql}`
    }
    protected createSelectSql(query: any = {}) {
        const selectSql = createSelectSql({ 
            name: this.name, 
            mapper: this.mapper, 
        })
        const whereSql = createWhereSql(query, this.mapper)
        return `${selectSql} ${whereSql}`
    }
}

type IRowMapper<T> = {
    name: keyof T,
    column?: string,
    editable?: boolean,
}

export type IBaseModel = {
    id: number,
    updatedTime: Date,
    createdTime: Date,
}

export type IRowsMapper<T> = IRowMapper<T>[]
const BASE_ROWS_MAPPER: IRowsMapper<IBaseModel> = [
    { name: 'id' },
    // { name: 'updatedTime', column: 'updated_time' },
    // { name: 'createdTime', column: 'created_time' },
]

type BaseQuery = { id?: number }
export abstract class BaseMapper<T, Q extends BaseQuery = any> extends BaseSql {
    private connection?: PoolConnectionProxy

    constructor(name: string, mapper: IRowsMapper<T>) {
        super(name, [ ...mapper, ...BASE_ROWS_MAPPER ])
    }

    protected async getConnection() {
    //   if (!this.connection) {
    //     this.connection = await getConnection()
    //   }
      return await getConnection()
    }

    public async getById(id?: number) {       
        if (!id) {
            return undefined
        }
        const conn = await this.getConnection()
        const sql = this.createSelectSql({ id })
        const rows = await conn.query(`${sql} LIMIT 1`)
        return rows[0]
    }

    public async getByQuery(query: Q) {        
        const conn = await this.getConnection()
        const sql = this.createSelectSql(query)
        const rows = await conn.query(`${sql} LIMIT 1`)
        return rows[0]
    }
    public async findByIds(ids: number[]) {
        const conn = await this.getConnection()
        const sql = this.createSelectSql({ id: ids })
        const rows = await conn.query(`${sql} LIMIT 50`)
        return rows
    }
    public async findByQuery(query: Q) {
        const conn = await this.getConnection()
        const sql = this.createSelectSql(query)
        const rows = await conn.query(`${sql} LIMIT 50`)
        return rows
    }
    public async findByPageQuery(pageQuery: IPaginationQuery) {
        await this.findAll(undefined, pageQuery)
    }
    public async findAll(query?: Q, pageQuery?: IPaginationQuery) {
        const conn = await this.getConnection()
        let pageSql = 'LIMIT 50'
        if (pageQuery)  {
            const { page = 1, size = 20, order = '' } = pageQuery
            if (page < 1) {
                throw { message: 'pagination page must > 0' }
            }
            if (size < 1) {
                throw { message: 'pagination size must > 0' }
            }
            const limitSql = mysql.format(`LIMIT ?, ?`, [page - 1, size])
            pageSql = `${this.createOrderSql(order as string)} ${limitSql}`
        }
        const totalSql = 'SELECT FOUND_ROWS() as `total`'
        const sql = this.createSelectSql(query)
        const rows = await conn.query(`${sql} ${pageSql}; ${totalSql}`)
        const total: number = rows[1][0].total
        const list: T[] = rows[0]
        return { list, total }
    }

    public async create(model: Partial<T>) {
        const conn = await this.getConnection()
        const sql = this.createInsertSql(model)
        const rows = await conn.query(sql)
        return rows.insertId
    }
    
    public async update(model: Partial<T>, query: Q) {
        const conn = await this.getConnection()
        const sql = this.createUpdateSql(model, query)
        const rows = await conn.query(sql)
        return rows.affectedRows
    }
    public async updateById(model: Partial<T>, id: number) {
        return await this.update(model, { id } as any)
    }
   
    public async delete(query: Q) {
        const conn = await this.getConnection()
        const sql = this.createUpdateSql({ isDeleted: true }, query)
        const rows = await conn.query(sql)
        return rows.affectedRows
    }

    public async deleteById(id: number) {
        return await this.delete({ id } as any)
    }

    public async deleteReal(query: Q) {
        const conn = await this.getConnection()
        const sql = this.createUpdateSql({ idDeleted: true }, query)
        await conn.query(sql)
    }
    public async deleteRealById(id: number) {
        await this.deleteReal({ id } as any)
    }
}