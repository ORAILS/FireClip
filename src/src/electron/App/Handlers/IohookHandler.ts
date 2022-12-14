import { BrowserWindow, Clipboard, globalShortcut, IpcMain, nativeImage } from 'electron'
import Store from 'electron-store'
import { IpcMainEvent } from 'electron/main'
import robot from 'robotjs'
import { ItemRepo } from '../../Data/ItemRepository'
import { IClipboardItem, isImageContent, isRTFContent, isTextContent } from '../../DataModels/DataTypes'
import { IAppState, IKeyboardEvent, ILocalUser, IMouseEvent, IReceiveChannel } from '../../DataModels/LocalTypes'
import { CryptoService } from '../../Utils/CryptoService'
import { JsUtil } from '../../Utils/JsUtil'
import { AppSettings, IUserSettings } from '../AppSettings'

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
const defaultHandler = (e: IpcMainEvent, event: any) => {
    store.set(`${getPreferenceKey(event.key)}`, event.value)
    console.log(event)
}
/**
 * Default user settings along with the default values if not already existing in the store.
 */
export const defaultUserSettings: IUserSettings = {
    // darkMode: {
    //     description: 'If enabled will turn on the dark mode',
    //     value: true,
    //     changeHandler: (e, event) => {
    //         defaultHandler(e, event)
    //         defaultUserSettings.darkMode.value = event.value
    //     }
    // },
    regiserCommandNumberShortcuts: {
        description: 'If enabled, will register the shortcuts cmd/ctrl+number from 0 to 9',
        value: true,
        changeHandler: (e, event) => {
            defaultHandler(e, event)
            defaultUserSettings.regiserCommandNumberShortcuts.value = event.value
            for (const command of shortcutList) {
                if (defaultUserSettings.regiserCommandNumberShortcuts) {
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
        description: 'If enabled, will show command and number icon at the start of the first 10 icons',
        value: true,
        changeHandler: (e, event) => {
            defaultHandler(e, event)
            defaultUserSettings.showCommandNumberIcons.value = event.value
        }
    },
    autoRestartOnUpdateAvailable: {
        description: 'If enabled, the app will restart as soon as an update was downloaded',
        value: true,
        changeHandler: (e, event) => {
            defaultHandler(e, event)
            defaultUserSettings.autoRestartOnUpdateAvailable.value = event.value
        }
    }
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
    hideWindow: (forced: boolean) => {
        if (forced || AppSettings.closeOnPaste) {
            localMainWindow.hide()
        }
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

        await action.pasteItem()
    },
    async pasteItem() {
        if (!AppSettings.enablePaste) return

        if (state.ctrlA) {
            await robot.keyTap('backspace')

            state.ctrlA = false
        }
        if (AppSettings.closeOnPaste) action.hideWindow(true)

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

        const rtf = localClipboard.readRTF()
        if (rtf.length > 0) {
            const hash = CryptoService.ContentHash(rtf, state.user.masterKey)
            if (hash === state.lastHash) return undefined
            newItem.content = rtf
            newItem.contentHash = hash
            newItem.type = 1
            return newItem
        }

        const text = localClipboard.readText()
        const hash = CryptoService.ContentHash(text, state.user.masterKey)
        if (hash === state.lastHash) return undefined
        newItem.content = text
        newItem.contentHash = hash
        newItem.type = 2
        return newItem
    },
    /**
     * Idea:
     * 1. check if was inited
     * 2. check if image rtf text
     * 3. create object
     * 4. save locally
     * 5. save remote
     */
    TrySaveClipboard: async (delayMs: number) => {
        // check if was inited
        await JsUtil.waitforme(delayMs)

        const item = await action.getClipboardItem()
        item ? console.log(item) : ''
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
        handler: async (ipcEvent: IpcMainEvent, event: IKeyboardEvent) => {
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
        handler: () => action.hideWindow(true)
    },
    /**
     * Event sent by the front-end to retreive the setting.
     */
    {
        name: 'get_settings',
        handler: () => {
            localMainWindow.webContents.send(channelsToRender.setSettings, JSON.stringify(defaultUserSettings))
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
                console.log(user)
                const hashed = CryptoService.HashUserLocal(user)
                state.user = hashed
                console.log(state.user)
                localMainWindow.webContents.send(channelsToRender.passwordConfirmed, true)
                action.startClipboardPooling()
                action.loadItems()
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
    incrementIndex: 'incrementIndex',
    textSearched: 'textSearched',
    hide: 'hide',
    unhide: 'unhide',
    setSettings: 'setSettings'
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
    for (const [key, val] of depictEntriesKeyType(defaultUserSettings)) {
        // getting key from the store
        const existin = store.get(getPreferenceKey(key))
        // if key not exist (is undefined) update the user setting
        if (existin !== undefined) {
            val.value = existin as typeof val.value
            defaultUserSettings[key] = val
        }
        // Enabling all the event handlers by receiving the even called by the same name from the frontend
        messageFromRenderer.on(key, val.changeHandler as never)
    }

    // if registering shortcuts is enabled
    if (defaultUserSettings.regiserCommandNumberShortcuts) {
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
}

export const ioHookHandler = {
    InitIOHook
}
