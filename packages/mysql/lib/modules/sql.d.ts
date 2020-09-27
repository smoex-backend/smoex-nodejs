declare type ISQLOptions = {
    name: string;
    mapper: any;
    model?: any;
    query?: any;
    extras?: any;
};
export declare const createInsertSql: (options: ISQLOptions) => string;
export declare const createSelectSql: (options: ISQLOptions) => string;
export declare const createUpdateSql: (options: ISQLOptions) => string;
export declare const createWhereSql: (query?: any, mapper?: any, join?: string) => string;
export declare const createOrderSql: (order: string, mapper?: any[]) => string;
export {};
