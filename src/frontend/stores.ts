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
export const previousEvent: Writable<IHookKeyboardEvent | undefined> = writable(undefined)
export const isPasswordAsked: Writable<boolean> = writable(false)
export const isPasswordIncorrect: Writable<boolean> = writable(false)
export const selectedClipId: Writable<string> = writable('')
export const userPassword: Writable<string> = writable('')
export const currentScrollIndex: Writable<number> = writable(-1)
export const clipList: Writable<[string, IClipboardItem][]> = writable([])
export const clipListFiltered: Writable<[string, IClipboardItem][]> = writable([])
export const showPassword: Writable<boolean> = writable(false)
export const passwordButtonText: Writable<string> = writable('show')
export const userSettings: Writable<IUserSettings | undefined> = writable(undefined)
export const isAppHidden: Writable<boolean> = writable(true)
export const currentSearchedText: Writable<string> = writable('')
