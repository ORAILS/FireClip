import type { IpcMainEvent } from 'electron'
import type { Writable } from 'svelte/store'

export interface IShortCut {
    combinations: string[][][]
    delayMsBetweenTriggers: number
    // maxTriggersPressed: number
    handler: () => Promise<void> | void
    editVisible: boolean
    combinationChangeHandler: (newValue: string[][][]) => Promise<void> | void
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

interface ItemBase {
    /**
     * 0 - image
     * 1 - rtf
     * 2 - text
     */
    contentType: 0 | 1 | 2
    // remoteId: number
    isFavorite: boolean
    /**
     * hash(hash(encryption key)+content)
     */
    hash: string
}

export enum RemoteItemStatus {
    fetchedFromRemote = 0,
    pushedToRemote = 1,
    existsOnlyLocally = 2,
    needsUpdateOnRemote = 3
}

export interface IClipboardItem extends ItemBase {
    content: string;
    created: Date
    modified: Date
    remoteStatus: RemoteItemStatus,
}

export interface IClipboardItemFrontend extends IClipboardItem {
    isVisible: boolean
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
    return obj.contentType === 2
}
export function isRTFContent(obj: IClipboardItem) {
    return obj.contentType === 1
}
export function isImageContent(obj: IClipboardItem) {
    return obj.contentType === 0
}

export function sortItemsByDate(a: [string, IClipboardItem], b: [string, IClipboardItem], ascending = false): number {
    return new Date(b[1].modified).getTime() - new Date(a[1].modified).getTime()
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
