import { writable } from 'svelte/store'
import { appSettings } from '../AppSettings'
import { IPages } from '../types'

const defaultPage: IPages = IPages.items

/**
 * Wether the app is focused (used for seaching function), as it's only triggered when focused
 */
export const isFocused = writable(0)
/**
 * Which page will be displayed to the user. Main user is App.svelte
 */
export const page = writable<IPages>(defaultPage)
/**
 * App name. Used by the pages above to update it.
 */
export const appName = writable(appSettings.name)
