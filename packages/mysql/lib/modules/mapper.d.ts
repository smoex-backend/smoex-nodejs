import { PoolConnectionProxy } from './pool';
export declare type IBaseSqls = {
    select?: string;
};
export declare type IPaginationQuery = {
    page?: number;
    size?: number;
    order?: string | string[];
};
export declare type IPaginationRes = {
    page: number;
    size: number;
    total: number;
    hasmore: boolean;
    maxpage: number;
};
export declare abstract class BaseSql {
    protected name: string;
    protected mapper: any;
    constructor(name: string, mapper: any);
    protected createWhereSql(query: any): string;
    protected createOrderSql(order: string): string;
    protected createInsertSql(model: any): string;
    protected createUpdateSql(model: any, query: any): string;
    protected createSelectSql(query?: any): string;
}
declare type IRowMapper<T> = {
    name: keyof T;
    column?: string;
    editable?: boolean;
};
export declare type IBaseModel = {
    id: number;
    updatedTime: Date;
    createdTime: Date;
};
export declare type IRowsMapper<T> = IRowMapper<T>[];
declare type BaseQuery = {
    id?: number;
};
export declare abstract class BaseMapper<T, Q extends BaseQuery = any> extends BaseSql {
    private connection?;
    constructor(name: string, mapper: IRowsMapper<T>);
    protected getConnection(): Promise<PoolConnectionProxy>;
    getById(id?: number): Promise<any>;
    getByQuery(query: Q): Promise<any>;
    findByIds(ids: number[]): Promise<any>;
    findByQuery(query: Q): Promise<any>;
    findByPageQuery(pageQuery: IPaginationQuery): Promise<void>;
    findAll(query?: Q, pageQuery?: IPaginationQuery): Promise<{
        list: T[];
        total: number;
    }>;
    create(model: Partial<T>): Promise<any>;
    update(model: Partial<T>, query: Q): Promise<any>;
    updateById(model: Partial<T>, id: number): Promise<any>;
    delete(query: Q): Promise<any>;
    deleteById(id: number): Promise<any>;
    deleteReal(query: Q): Promise<void>;
    deleteRealById(id: number): Promise<void>;
}
export {};
