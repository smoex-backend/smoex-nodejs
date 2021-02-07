import { Context, Next } from 'koa';
export declare const ERROR_CODE: {
    UNKNOW: number;
    NOTFOUND: number;
};
export declare const normalizeError: (ctx: Context, next: Next) => Promise<void>;
export declare const normalizeData: (ctx: Context, next: Next) => Promise<void>;
