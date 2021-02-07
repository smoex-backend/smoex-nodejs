export * from './normalize';
export * from './proxy';
export * from './vaildate';
export declare const initialize: (ctx: any, next: any) => Promise<void>;
export declare const staticRemote: (remotePaths?: any[]) => (ctx: any, next: any) => Promise<void>;
