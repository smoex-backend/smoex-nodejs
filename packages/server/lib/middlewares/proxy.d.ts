import { Context, Next } from 'koa';
export declare function requestProxy(proxies?: any): (ctx: any, next: any) => Promise<void>;
export declare function staticProxy(remotePaths: any[], opts?: any): (ctx: Context, next: Next) => Promise<void>;
