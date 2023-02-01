import type { IpcMainEvent } from 'electron'

export interface AppState {
    previous: IHookKeyboardEvent | undefined
    isAsked: boolean
    passwordIncorrect: boolean
    itemIdSelected: string
    password: string
    index: number
    clipboardList: [string, IClipboardItem][]
    clipboardListFiltered: [string, IClipboardItem][]
    showPassword: boolean
    passwordButtonText: string
    hidden: boolean
    defaultUserSettings: IUserSettings | undefined
}

export interface IReceiveChannel {
    name: string
    handler: (event: IpcMainEvent, data: never) => Promise<void> | void
}

export interface IClipboardItemEncrypted {
    encrypted: string
    hash: string
    localId: number
    serverId: number
}

export interface IUserSettings {
    darkMode: IUserSetting<boolean>
    regiserCommandNumberShortcuts: IUserSetting<boolean>
    showCommandNumberIcons: IUserSetting<boolean>
    autoRestartOnUpdateAvailable: IUserSetting<boolean>
}

export interface IUserSetting<T> {
    description: string
    value: T
    changeHandler: (newValue: T) => void | null
}

export interface ItemBase {
    /**
     * 0 - image
     * 1 - rtf
     * 2 - text
     */
    type: 0 | 1 | 2
    remoteId: number
    isFavourite: boolean
    created: Date
    lastModified: Date
    contentHash: string
}

/**
 * Enum with all the pages that exist.
 */
export enum IPages {
    settings,
    items,
    notifications
}

export interface IClipboardItem extends ItemBase {
    content: string
}

export function isTextContent(obj: ItemBase) {
    return obj.type === 2
}
export function isRTFContent(obj: ItemBase) {
    return obj.type === 1
}
export function isImageContent(obj: ItemBase) {
    return obj.type === 0
}

export function sortItemsByDate(a: [string, IClipboardItem], b: [string, IClipboardItem], ascending = false): number {
    if (ascending) new Date(a[1].lastModified).getTime() - new Date(b[1].lastModified).getTime()
    return new Date(b[1].lastModified).getTime() - new Date(a[1].lastModified).getTime()
}

export interface DbData {
    items: string
    maxIndex: number
    isEncrypted: boolean
}

export interface IHookMouseEvent {
    button: number
    clicks: number
    x: number
    y: number
    type: string
}

export interface IHookKeyboardEvent {
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
    keycode: number
    rawcode: number
    type: string
}
