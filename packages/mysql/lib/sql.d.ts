declare type ISQLOptions = {
    name: string;
    mapper: any;
    model?: any;
    query?: any;
    extras?: any;
};
export declare const createInsertSql: (options: ISQLOptions) => any;
export declare const createSelectSql: (options: ISQLOptions) => any;
export declare const createUpdateSql: (options: ISQLOptions) => any;
export declare const createWhereSql: (query?: any, mapper?: any, join?: string) => any;
export declare const createOrderSql: (order: string, mapper?: any[]) => any;
export {};
