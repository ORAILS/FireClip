import { globalShortcut } from 'electron'
import Store from 'electron-store'
import { IpcMainEvent } from 'electron/main'
import { JsUtil } from '../Utils/JsUtil'
import { AppSettings } from './AppSettings'
import { action, handleCleanUpParameterChange, messageFromRenderer } from './EventHandler'

/**
 * User preference object, the property name is used as key for saving the preference
 */

export interface IUserPreference<T> {
    displayName: string
    description: string
    // insert default value here
    value: T
    type: 'toggle' | 'select' | 'number' | 'string'
    selectableOptions: T[] | undefined
    changeHandler: (event: IpcMainEvent, data: any) => Promise<void> | void
}
/**
 * Used to store user settings. Naming the values is important as they are used for displaying to the user.
 */

export interface IUserPreferences {
    darkMode: IUserPreference<'system' | 'on' | 'off'>
    keyboardLayout: IUserPreference<'qwerty' | 'dvorak'>
    authUrl: IUserPreference<string>
    storeUrl: IUserPreference<string>
    remoteSyncInterval: IUserPreference<number>
    enableRemoteSync: IUserPreference<boolean>
    enableKeyboardShortcuts: IUserPreference<boolean>
    regiserCommandNumberShortcuts: IUserPreference<boolean>
    showCommandNumberIcons: IUserPreference<boolean>
    autoRestartOnUpdateAvailable: IUserPreference<boolean>
    minimizeAfterPaste: IUserPreference<boolean>
    enableAutoPaste: IUserPreference<boolean>
    maxClipAgeInHours: IUserPreference<number>
    maxNumberOfClips: IUserPreference<number>
}

export const store = new Store()

/**
 * Used to generate the key for the electron-storage preference saving
 */
const getPreferenceKey = (key: string) => `${AppSettings.name}.preferences.${key}`
/**
 * Default handler for the preference changes event
 */
const defaultHandler = async (e: IpcMainEvent, event: any) => {
    store.set(`${getPreferenceKey(event.key)}`, event.value)
    // so that the front end can also react to this change
    await JsUtil.waitforme(50)
    action.sendSettings(userPreferences)
}

/**
 * User settings along with the default values if not already existing in the store.
 */
export const userPreferences: IUserPreferences = {
    darkMode: {
        displayName: 'Dark Mode',
        description: 'Controls dark mode behaviour.',
        value: 'system',
        type: 'select',
        selectableOptions: ['off', 'on', 'system'],
        changeHandler: (e, event) => {
            userPreferences.darkMode.value = event.value
            defaultHandler(e, event)
        }
    },
    keyboardLayout: {
        displayName: 'Keyboard layout',
        description: 'Controls the buttons displayed in shortcuts menu',
        value: 'qwerty',
        type: 'select',
        selectableOptions: ['dvorak', 'qwerty'],
        changeHandler: (e, event) => {
            userPreferences.keyboardLayout.value = event.value
            defaultHandler(e, event)
        }
    },
    regiserCommandNumberShortcuts: {
        displayName: 'Register [CMD+No] shortcuts',
        description: 'If enabled, will register the shortcuts cmd/ctrl+number from 0 to 9',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.regiserCommandNumberShortcuts.value = event.value
            defaultHandler(e, event)
            for (const command of globalRegisteredShortcuts) {
                if (userPreferences.regiserCommandNumberShortcuts) {
                    globalShortcut.register(command, () => null)
                    console.log(`shortcut registered`)
                } else {
                    globalShortcut.unregister(command)
                    console.log(`shortcuts unregistered`)
                }
            }
        }
    },
    enableKeyboardShortcuts: {
        displayName: 'Enable keyboard shortcuts',
        description: 'If enabled, registered keyboard shortcuts will work',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.enableKeyboardShortcuts.value = event.value
            defaultHandler(e, event)
        }
    },
    showCommandNumberIcons: {
        displayName: 'Show [CMD+No] icons on items page',
        description: 'If enabled, will show command and number icon at the start of the first 10 icons',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.showCommandNumberIcons.value = event.value
            defaultHandler(e, event)
        }
    },
    autoRestartOnUpdateAvailable: {
        displayName: 'Auto restart on update available',
        description: 'If enabled, the app will restart as soon as an update was downloaded, if off, will update on restart',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.autoRestartOnUpdateAvailable.value = event.value
            defaultHandler(e, event)
        }
    },
    minimizeAfterPaste: {
        displayName: 'Minimize after paste',
        description: 'If enabled, the app will minimize after pasting the item',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.minimizeAfterPaste.value = event.value
            defaultHandler(e, event)
        }
    },
    enableAutoPaste: {
        displayName: 'Auto paste item',
        description: 'If enabled, the app will paste the selected item, if not, it will only be written to the clipboard',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.enableAutoPaste.value = event.value
            defaultHandler(e, event)
        }
    },
    maxClipAgeInHours: {
        displayName: 'Maximum clip age in hours',
        description: 'Items older than this value in hours will get deleted. Supports fractional numbers',
        value: 48,
        type: 'number',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.maxClipAgeInHours.value = event.value
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    },
    maxNumberOfClips: {
        displayName: 'Maximum number of clips saved',
        description: 'Any items over this value will get deleted, starting with the oldest',
        value: 1000,
        type: 'number',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.maxNumberOfClips.value = event.value
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    },
    authUrl: {
        displayName: 'Auth server URL',
        description: 'the server used for authentication',
        value: "https://fireclip-auth.cap.danr.cc",
        type: 'string',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.authUrl.value = event.value
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    },
    storeUrl: {
        displayName: 'Store server URL',
        description: 'server used for clips storage',
        value: "https://fireclip-clips-dev-2.cap.danr.cc",
        type: 'string',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.storeUrl.value = event.value
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    },
    remoteSyncInterval: {
        displayName: 'Interval in seconds to perform a remote sync',
        description: 'Every time an amount of seconds equal to this value passes, the app will sync to the remote storage.',
        value: 15000,
        type: 'number',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.remoteSyncInterval.value = event.value * 1000
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    },
    enableRemoteSync: {
        displayName: 'Enable remote sync',
        description: 'If enabled, the items will be pushed to the "cloud" to sync on other devices',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userPreferences.enableRemoteSync.value = event.value
            defaultHandler(e, event)
        }
    },
}

/**
 * Shortcuts that will be registered if user selected to do so (enabled by default)
 */
const globalRegisteredShortcuts = [
    'CommandOrControl+1',
    'CommandOrControl+2',
    'CommandOrControl+3',
    'CommandOrControl+4',
    'CommandOrControl+5',
    'CommandOrControl+6',
    'CommandOrControl+7',
    'CommandOrControl+8',
    'CommandOrControl+9',
    'CommandOrControl+0'
]

export const InitUserSettings = async () => {
    /**
     * Used to return a typed object when using the method below
     */
    type Entries<T> = {
        [K in keyof T]: [K, T[K]]
    }[keyof T][]
    /**
     * A typed overload of Object.entries() returning the typed key and value based on object input.
     */
    function depictEntriesKeyType<T>(object: T): Entries<T> {
        return Object.entries(object as unknown as object) as never
    }

    /**
     * Going over all enabled user settings and checking if they are saved.
     */
    for (const [key, val] of depictEntriesKeyType(userPreferences)) {
        // getting key from the store
        const existin = store.get(getPreferenceKey(key))
        // if key not exist (is undefined) update the user setting
        if (existin !== undefined) {
            val.value = existin as typeof val.value
            userPreferences[key] = val as never
        }
        // Enabling all the settings changed event handlers
        messageFromRenderer.on(key, val.changeHandler as never)
    }

    // if registering shortcuts is enabled
    if (userPreferences.regiserCommandNumberShortcuts) {
        for (const command of globalRegisteredShortcuts) {
            globalShortcut.register(command, () => null)
        }
        console.log(`shortcuts registered`)
    }

    // default triggering shortcut, always enabled (most likely also a user settings in the future)
    globalShortcut.register('CommandOrControl+`', () => {
    })
}
