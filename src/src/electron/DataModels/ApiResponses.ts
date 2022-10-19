import { IRemoteUser } from './LocalTypes'

export interface ILoginResponse {
    token: string
    user: IRemoteUser
}

export interface IRefreshResponse {
    token: string
}

export interface IBulkAddResponse {
    localId: number
    serverId: number
}
