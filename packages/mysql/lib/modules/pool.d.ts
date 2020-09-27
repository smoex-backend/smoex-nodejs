export declare type PoolConnectionProxy = {
    query: (sql: string, values?: any) => Promise<any>;
    beginTransaction: () => Promise<any>;
    commit: () => Promise<any>;
    rollback: () => Promise<any>;
    release: () => void;
};
export declare const getConnection: () => Promise<PoolConnectionProxy>;
