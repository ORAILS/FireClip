import type { IpcMainEvent } from 'electron'
import type { Writable } from 'svelte/store'

export interface IShortCut {
    combination: string[][]
    handler: () => Promise<void> | void
}

export interface AppState {
    previous: Writable<IHookKeyboardEvent | undefined>
    isAsked: Writable<boolean>
    passwordIncorrect: Writable<boolean>
    itemIdSelected: Writable<string>
    password: Writable<string>
    index: Writable<number>
    clipboardList: Writable<[string, IClipboardItem][]>
    clipboardListFiltered: Writable<[string, IClipboardItem][]>
    showPassword: Writable<boolean>
    passwordButtonText: Writable<string>
    hidden: Writable<boolean>
    defaultUserSettings: Writable<IUserSettings | undefined>
    searchedText: Writable<string>
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
    darkMode: IUserSetting<'system' | 'on' | 'off'>
    keyboardLayout: IUserSetting<'qwerty' | 'dvorak'>
    regiserCommandNumberShortcuts: IUserSetting<boolean>
    showCommandNumberIcons: IUserSetting<boolean>
    autoRestartOnUpdateAvailable: IUserSetting<boolean>
    minimizeAfterPaste: IUserSetting<boolean>
    enableAutoPaste: IUserSetting<boolean>
    maxClipAgeInHours: IUserSetting<number>
    maxNumberOfClips: IUserSetting<number>
}

export interface IUserSetting<T> {
    displayName: string
    description: string
    value: T
    type: 'toggle' | 'select' | 'number' | 'string'
    selectableOptions: T[] | undefined
    changeHandler: (event: IpcMainEvent, data: any) => Promise<void> | void
}

export interface IClipboardItem {
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
    isVisible: boolean
    content: string
}

/**
 * Enum with all the pages that exist.
 */
export enum IPages {
    settings,
    items,
    notifications,
    login,
    shortcuts
}

export function isTextContent(obj: IClipboardItem) {
    return obj.type === 2
}
export function isRTFContent(obj: IClipboardItem) {
    return obj.type === 1
}
export function isImageContent(obj: IClipboardItem) {
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
