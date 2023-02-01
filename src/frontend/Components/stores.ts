import { writable } from 'svelte/store'
import { appSettings } from '../AppSettings'
import { AppState, IPages } from '../types'

const defaultPage: IPages = IPages.items
export const ipcRenderer = window.require('electron').ipcRenderer
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

const appState: AppState = {
    previous: undefined,
    isAsked: false,
    passwordIncorrect: false,
    itemIdSelected: '',
    password: '',
    index: -1,
    clipboardList: [],
    clipboardListFiltered: [],
    showPassword: false,
    passwordButtonText: 'show',
    defaultUserSettings: undefined,
    hidden: true
}

export const state = writable<AppState>(appState)
