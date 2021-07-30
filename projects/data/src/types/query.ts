export type BaseQueryReq = {
    name: string
}

export type BaseSyncReq = BaseQueryReq & {
    json?: string,
}

export type BaseStateReq = BaseQueryReq & {
    access?: 'private' | 'public' | 'latest'
}

export type BaseLastestReq = BaseQueryReq

export type BaseLastestResp = {
    json: string,
}

export type BaseHistoryReq = BaseQueryReq

export type BaseHistoryResp = {
    list: any[],
}
