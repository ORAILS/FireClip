import { IpcMainEvent } from 'electron/main'

export interface IKeyboardEvent {
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
    keycode: number
    rawcode: number
    type: string
}

export interface IAppState {
    user: ILocalUser | undefined
    pullInterval: NodeJS.Timer | undefined
    remoteSyncInterval: NodeJS.Timer | undefined
    // index: number
    ctrlA: boolean
    last: number
    last2: number
    last3: number
    lastHash: string
}

export interface IReceiveChannel {
    name: string
    handler: (event: IpcMainEvent, data: never) => Promise<void> | void
}

export interface IMouseEvent {
    button: number
    clicks: number
    x: number
    y: number
    type: string
}

export interface ILocalUser {
    name: string
    masterKey: string
}

export interface IRemoteUser {
    name: string
    email: string
    masterPasswordHash: string
}

export interface ITokenPayload {
    exp: number
    id: number
    iss: string
    scopes: string[]
    kid: string
    data: object | null
}

export interface AppData {
    loggedIn: boolean
    latestServerUser: IRemoteUser
    searchLevel: number
    loadLevel: number
    syncLevel: number
}
