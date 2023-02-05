import { Writable, writable } from 'svelte/store'
import { IClipboardItem, IHookKeyboardEvent, IPages, IUserSettings } from './types'

/**
 * Wether the app is focused (used for seaching function), as it's only triggered when focused
 */
export const isFocused = writable(0)
/**
 * Which page will be displayed to the user. Main user is App.svelte
 */
export const page = writable<IPages>(IPages.items)
/**
 * App name. Used by the pages above to update it.
 */
export const appName: Writable<string> = writable('FireClip')
export const previous: Writable<IHookKeyboardEvent | undefined> = writable(undefined)
export const isAsked: Writable<boolean> = writable(false)
export const passwordIncorrect: Writable<boolean> = writable(false)
export const itemIdSelected: Writable<string> = writable('')
export const password: Writable<string> = writable('')
export const index: Writable<number> = writable(-1)
export const clipboardList: Writable<[string, IClipboardItem][]> = writable([])
export const clipboardListFiltered: Writable<[string, IClipboardItem][]> = writable([])
export const showPassword: Writable<boolean> = writable(false)
export const passwordButtonText: Writable<string> = writable('show')
export const defaultUserSettings: Writable<IUserSettings | undefined> = writable(undefined)
export const hidden: Writable<boolean> = writable(true)
export const searchedText: Writable<string> = writable('')
