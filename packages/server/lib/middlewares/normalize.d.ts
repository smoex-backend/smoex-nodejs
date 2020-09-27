import { Context, Next } from 'koa';
export declare const normalizeError: (ctx: Context, next: Next) => Promise<void>;
export declare const normalizeData: (ctx: Context, next: Next) => Promise<void>;
