import { BrowserWindow, Clipboard, dialog, globalShortcut, IpcMain, nativeImage } from 'electron'
import Store from 'electron-store'
import { IpcMainEvent } from 'electron/main'
import * as fs from 'fs'
import robot from 'robotjs'
import { ItemRepo } from '../Data/ItemRepository'
import { IClipboardItem, isImageContent, isRTFContent, isTextContent } from '../DataModels/DataTypes'
import { IAppState, IKeyboardEvent, ILocalUser, IMouseEvent, IReceiveChannel } from '../DataModels/LocalTypes'
import { CryptoService } from '../Utils/CryptoService'
import { JsUtil } from '../Utils/JsUtil'
import { AppSettings, IUserSettings } from './AppSettings'

const store = new Store()

const state: IAppState = {
    pullInterval: undefined,
    index: 0,
    ctrlA: false,
    last: 0,
    last2: 0,
    last3: 0,
    user: undefined,
    lastHash: ''
}
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
    action.sendSettings()
}

async function saveJSONFile(data: object) {
    // Show a "Save File" dialog to the user
    const res = await dialog.showSaveDialog(localMainWindow, {
        filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (res.filePath) {
        // Write the JSON data to the selected file
        fs.writeFile(res.filePath, JSON.stringify(data), 'utf8', (err) => {
            if (err) {
                console.error(err)
            } else {
                console.log(`JSON file saved to ${res.filePath}`)
            }
        })
    }
}

/**
 * User settings along with the default values if not already existing in the store.
 */
export const userSettings: IUserSettings = {
    darkMode: {
        displayName: 'Dark Mode',
        description: 'Controls dark mode behaviour.',
        value: 'system',
        type: 'select',
        selectableOptions: ['off', 'on', 'system'],
        changeHandler: (e, event) => {
            userSettings.darkMode.value = event.value
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
            userSettings.keyboardLayout.value = event.value
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
            userSettings.regiserCommandNumberShortcuts.value = event.value
            defaultHandler(e, event)
            for (const command of shortcutList) {
                if (userSettings.regiserCommandNumberShortcuts) {
                    globalShortcut.register(command, () => null)
                    console.log(`shortcut registered`)
                } else {
                    globalShortcut.unregister(command)
                    console.log(`shortcuts unregistered`)
                }
            }
        }
    },
    showCommandNumberIcons: {
        displayName: 'Show [CMD+No] icons on items page',
        description: 'If enabled, will show command and number icon at the start of the first 10 icons',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userSettings.showCommandNumberIcons.value = event.value
            defaultHandler(e, event)
        }
    },
    autoRestartOnUpdateAvailable: {
        displayName: 'Auto restart on update available',
        description: 'If enabled, the app will restart as soon as an update was downloaded, if off, will update on restart.',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userSettings.autoRestartOnUpdateAvailable.value = event.value
            defaultHandler(e, event)
        }
    },
    minimizeAfterPaste: {
        displayName: 'Minimize after paste',
        description: 'If enabled, the app will minimize after pasting the item.',
        value: true,
        type: 'toggle',
        selectableOptions: undefined,
        changeHandler: (e, event) => {
            userSettings.minimizeAfterPaste.value = event.value
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
            userSettings.enableAutoPaste.value = event.value
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
            userSettings.maxClipAgeInHours.value = event.value
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
            userSettings.maxNumberOfClips.value = event.value
            defaultHandler(e, event)
            handleCleanUpParameterChange()
        }
    }
}

let cleanUpInterval: NodeJS.Timer | undefined = undefined

const handleCleanUpParameterChange = () => {
    if (cleanUpInterval) {
        clearInterval(cleanUpInterval)
    }
    cleanUpInterval = setInterval(() => {
        console.log('Cleaning started')
        const wasCleaned = items()?.cleanUp(userSettings.maxClipAgeInHours.value * 60 * 60, userSettings.maxNumberOfClips.value)
        if (wasCleaned) {
            console.log('Was cleaned!')
            action.loadItems()
        }
    }, 5 * 60 * 1000)
}

const items = () => {
    if (state.user === undefined) {
        action.askPassword()
        return
    }
    return ItemRepo
}

const action = {
    askPassword: async () => localMainWindow.webContents.send(channelsToRender.askPassword, true),
    sendSettings: () => localMainWindow.webContents.send(channelsToRender.setSettings, JSON.stringify(userSettings)),
    hideWindow: () => {
        localMainWindow.hide()
        localMainWindow.webContents.send(channelsToRender.hide, true)
    },
    handleShortcut: () => {
        localMainWindow.showInactive()
        localMainWindow.webContents.send(channelsToRender.unhide, true)
    },
    resetIndex: () => {
        state.index = items()?.getAll.length as number
        localMainWindow.webContents.send(channelsToRender.indexChange, -1)
    },
    resetSearch() {
        localMainWindow.webContents.send(channelsToRender.searchReset, true)
    },
    sendItems(itemList: Map<string, IClipboardItem> | undefined, resetItemIndex?: boolean, resetSearchField?: boolean) {
        localMainWindow.webContents.send(channelsToRender.loadItems, itemList)
        resetItemIndex ? action.resetIndex() : null
        resetSearchField ? action.resetSearch() : null
    },
    loadItems() {
        try {
            action.sendItems(items()?.getAll(), true, true)
        } catch (error) {
            console.log(error)
        }
    },
    async startClipboardPooling() {
        if (state.pullInterval) return
        state.pullInterval = setInterval(async () => await action.TrySaveClipboard(10), 200)
    },
    async writeToClipboard(hash: string) {
        const result = items()?.get(hash)
        if (!result) throw new Error('Item not found')

        if (isTextContent(result)) localClipboard.writeText(result.content)
        if (isRTFContent(result)) localClipboard.writeRTF(result.content)
        if (isImageContent(result)) localClipboard.writeImage(nativeImage.createFromDataURL(result.content))

        if (userSettings.enableAutoPaste.value) {
            await action.pasteItem()
        }
    },
    async pasteItem() {
        if (!AppSettings.enablePaste) return

        if (state.ctrlA) {
            await robot.keyTap('backspace')

            state.ctrlA = false
        }
        if (userSettings.minimizeAfterPaste.value) action.hideWindow()

        if (AppSettings.isWin) robot.keyTap('v', 'control')
        if (AppSettings.isMac) robot.keyTap('v', 'command')
        if (AppSettings.isLinux) robot.keyTap('v', 'command')
    },
    getClipboardItem: async (): Promise<IClipboardItem | undefined> => {
        if (state.user === undefined) {
            action.askPassword()
            return
        }

        const newItem: IClipboardItem = {
            type: 0,
            remoteId: -1,
            isFavourite: false,
            created: new Date(),
            lastModified: new Date(),
            contentHash: '',
            content: ''
        }

        const base64Png = localClipboard.readImage().toDataURL()
        if (base64Png.length > 23) {
            const hash = CryptoService.ContentHash(base64Png, state.user.masterKey)
            if (hash === state.lastHash) return undefined
            newItem.content = base64Png
            newItem.contentHash = hash
            return newItem
        }

        // TODO REVISIT RTF SUPPORT IN FUTURE.
        // const rtf = localClipboard.readRTF()
        // if (rtf.length > 0) {
        //     const hash = CryptoService.ContentHash(rtf, state.user.masterKey)
        //     if (hash === state.lastHash) return undefined
        //     newItem.content = rtf
        //     newItem.contentHash = hash
        //     newItem.type = 1
        //     return newItem
        // }

        const text = localClipboard.readText()
        const hash = CryptoService.ContentHash(text, state.user.masterKey)
        if (hash === state.lastHash) return undefined
        newItem.content = text
        newItem.contentHash = hash
        newItem.type = 2
        return newItem
    },

    TrySaveClipboard: async (delayMs: number) => {
        // check if was inited
        await JsUtil.waitforme(delayMs)

        const item = await action.getClipboardItem()
        if (!item) return
        state.lastHash = item.contentHash
        items()?.add(item, state.user?.masterKey as string)
        action.loadItems()
    }
}

// from FrontEnd , iohook specific
const ioHookChannels: IReceiveChannel[] = [
    {
        name: 'keydown',
        handler: async () => {
            await action.TrySaveClipboard(50)
        }
    },
    {
        name: 'keyup',
        handler: async (ipcEvent: IpcMainEvent, event: IKeyboardEvent) => {
            console.log(event)
        }
    },
    {
        name: 'mouseclick',
        handler: async (ipcEvent: IpcMainEvent, event: IMouseEvent) => {
            console.log(event)
        }
    }
]

/**
 * Events send by the front-end, not Iohook specific
 */
const channelsFromRender: IReceiveChannel[] = [
    {
        name: 'window_minimize',
        handler: () => action.hideWindow()
    },
    /**
     * Event sent by the front-end to retreive the setting.
     */
    {
        name: 'get_settings',
        handler: () => {
            action.sendSettings()
        }
    },
    {
        name: 'save_items',
        handler: async (event: IpcMainEvent, data: object) => {
            await saveJSONFile(data)
        }
    },
    {
        name: 'getItems',
        handler: () => action.loadItems()
    },
    {
        name: 'loginUser',
        handler: async (event: IpcMainEvent, user: ILocalUser) => {
            try {
                const hashed = CryptoService.HashUserLocal(user)
                state.user = hashed
                console.log(state.user)
                if (state.user.masterKey === '4f0a1743088714e60c5f0ada7d6a3717fa5aa5f195a9b121fc929151b8fb06da') {
                    action.startClipboardPooling()
                    action.loadItems()
                    action.sendSettings()
                    localMainWindow.webContents.send(channelsToRender.passwordConfirmed, true)
                }
            } catch (e) {
                console.log(e)
            }
        }
    },
    {
        name: 'RendererInit',
        handler: () => action.askPassword()
    },
    {
        name: 'paste',
        handler: async (event: IpcMainEvent, id: string) => await action.writeToClipboard(id)
    },
    {
        name: 'focus',
        handler: async (event: IpcMainEvent, value: boolean) => {
            localMainWindow.show()
            console.log('focus')
        }
    },
    {
        name: 'textSearched',
        handler: async (event: IpcMainEvent, text: string) => localMainWindow.webContents.send(channelsToRender.textSearched, text)
    }
]

/**
 * Events sent to the renderer (front-end)
 */
const channelsToRender = {
    indexChange: 'indexChange',
    loadItems: 'loadItems',
    searchReset: 'searchReset',
    askPassword: 'askPassword',
    passwordConfirmed: 'passwordConfirmed',
    passwordIncorrect: 'passwordIncorrect',
    /**
     * Used when new items are added to reset the search.
     */
    textSearched: 'textSearched',
    /**
     * used to set a state in the front end
     */
    hide: 'hide',
    /**
     * used to set a state in the front end
     */
    unhide: 'unhide',
    setSettings: 'to.renderer.set.settings'
}

let localClipboard: Clipboard
let localMainWindow: BrowserWindow
let messageFromRenderer: IpcMain

/**
 * Shortcuts that will be registered if user selected to do so (enabled by default)
 */
const shortcutList = [
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

async function InitIOHook(ipcMain: IpcMain, clipboard: Clipboard, mainWindow: BrowserWindow) {
    localClipboard = clipboard
    localMainWindow = mainWindow
    messageFromRenderer = ipcMain

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
     * Going over all enabled user settings (which can be turned on/off)
     */
    for (const [key, val] of depictEntriesKeyType(userSettings)) {
        // getting key from the store
        const existin = store.get(getPreferenceKey(key))
        // if key not exist (is undefined) update the user setting
        if (existin !== undefined) {
            val.value = existin as typeof val.value
            userSettings[key] = val as never
        }
        // Enabling all the event handlers by receiving the even called by the same name from the frontend
        messageFromRenderer.on(key, val.changeHandler as never)
    }

    // if registering shortcuts is enabled
    if (userSettings.regiserCommandNumberShortcuts) {
        for (const command of shortcutList) {
            globalShortcut.register(command, () => null)
        }
        console.log(`shortcuts registered`)
    }

    // default triggering shortcut, always enabled (most likely also a user settings in the future)
    globalShortcut.register('CommandOrControl+`', () => {
        action.handleShortcut()
    })

    for (const event of channelsFromRender) {
        messageFromRenderer.on(event.name, event.handler as never)
    }

    for (const event of ioHookChannels) {
        messageFromRenderer.on(event.name, event.handler as never)
    }

    action.resetIndex()

    handleCleanUpParameterChange()
}

export const ioHookHandler = {
    InitIOHook
}
