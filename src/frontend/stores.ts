import { Writable, writable } from 'svelte/store'
import { IClipboardItemFrontend, IPages, IUserPreferences } from './types'

/**
 * Wether the app is focused (used for seaching function), as it's only triggered when focused
 */
export const isFocused = writable(0)
/**
 * Which page will be displayed to the user. Main user is App.svelte
 */
export const currentPage = writable<IPages>(IPages.login)
/**
 * App name. Used by the pages above to update it.
 */
export const appName: Writable<string> = writable('FireClip')
// export const previousEvent: Writable<IHookKeyboardEvent | undefined> = writable(undefined)
// export const currentEvent: Writable<IHookKeyboardEvent | undefined> = writable(undefined)
export const pressedKeysSizeLimit = 20
export const pressedKeys: Writable<string[][]> = writable([[]])
export const isPasswordAsked: Writable<boolean> = writable(false)
export const isPasswordIncorrect: Writable<boolean> = writable(false)
export const selectedClipId: Writable<string> = writable('')
export const currentScrollIndex: Writable<number> = writable(-1)
export const clipList: Writable<[string, IClipboardItemFrontend][]> = writable([])
export const clipListFiltered: Writable<[string, IClipboardItemFrontend][]> = writable([])
export const visibleClipsHashes: Writable<string[]> = writable([])
export const showPassword: Writable<boolean> = writable(false)
export const passwordButtonText: Writable<string> = writable('show')
export const userPreferences: Writable<IUserPreferences | undefined> = writable(undefined)
export const isAppHidden: Writable<boolean> = writable(true)
export const currentSearchedText: Writable<string> = writable('')
export const searchOnlyImages: Writable<boolean> = writable(false)
export const shortcutsJson: Writable<string> = writable('')

export const loginPageMessage: Writable<string> = writable("")

export const backendLogs: Writable<string[]> = writable([])