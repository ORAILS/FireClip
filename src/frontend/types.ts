import type { IpcMainEvent } from 'electron'
import type { Writable } from 'svelte/store'

export interface IShortCut {
    combinations: string[][][]
    delayMsBetweenTriggers: number
    // maxTriggersPressed: number
    handler: () => Promise<void> | void
    editVisible: boolean
    combinationChangeHandler: (newValue: string[][][])=> Promise<void> | void
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
    defaultUserSettings: Writable<IUserPreferences | undefined>
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

export interface IUserPreference<T> {
    displayName: string
    description: string
    value: T
    type: 'toggle' | 'select' | 'number' | 'string'
    selectableOptions: T[] | undefined
    changeHandler: (event: IpcMainEvent, data: any) => Promise<void> | void
}

export interface IUserPreferences {
    darkMode: IUserPreference<'system' | 'on' | 'off'>
    keyboardLayout: IUserPreference<'qwerty' | 'dvorak'>
    enableKeyboardShortcuts: IUserPreference<boolean>
    regiserCommandNumberShortcuts: IUserPreference<boolean>
    showCommandNumberIcons: IUserPreference<boolean>
    autoRestartOnUpdateAvailable: IUserPreference<boolean>
    minimizeAfterPaste: IUserPreference<boolean>
    enableAutoPaste: IUserPreference<boolean>
    maxClipAgeInHours: IUserPreference<number>
    maxNumberOfClips: IUserPreference<number>
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
    shortcuts,
    info
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
