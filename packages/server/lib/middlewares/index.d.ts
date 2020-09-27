export * from './normalize';
export * from './proxy';
export * from './vaildate';
import { Context, Next } from 'koa';
export declare const initialize: (ctx: Context, next: Next) => Promise<void>;
export declare const staticRemote: (remotePaths?: any[]) => (ctx: Context, next: Next) => Promise<void>;
