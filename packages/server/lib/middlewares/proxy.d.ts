import { Context, Next } from 'koa';
export declare function requestProxy(): (ctx: any, next: any) => Promise<void>;
export declare function staticProxy(): (ctx: Context, next: Next) => Promise<void>;
