export declare type PoolConnectionProxy = {
    query: (sql: string, values?: any) => Promise<any>;
};
export declare const getConnection: () => Promise<PoolConnectionProxy>;
