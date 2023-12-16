import { BrowserWindow, Clipboard, dialog, IpcMain, nativeImage } from 'electron'
import { IpcMainEvent } from 'electron/main'
import * as fs from 'fs'
import robot from 'robotjs'
import { ItemRepo } from '../Data/ItemRepository'
import { IClipboardItem, isImageContent, isRTFContent, isTextContent } from '../DataModels/DataTypes'
import { IAppState, IKeyboardEvent, ILocalUser, IMouseEvent, IReceiveChannel } from '../DataModels/LocalTypes'
import { CryptoService } from '../Utils/CryptoService'
import { JsUtil } from '../Utils/JsUtil'
import { AppSettings } from './AppSettings'
import { InitUserSettings, IUserPreferences, userPreferences } from './UserPreferences'

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

let cleanUpInterval: NodeJS.Timer | undefined = undefined

export const handleCleanUpParameterChange = () => {
    if (cleanUpInterval) {
        clearInterval(cleanUpInterval)
    }
    cleanUpInterval = setInterval(() => {
        console.log('Cleaning started')
        const wasCleaned = items()?.cleanUp(userPreferences.maxClipAgeInHours.value * 60 * 60, userPreferences.maxNumberOfClips.value)
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

export const action = {
    askPassword: async () => localMainWindow.webContents.send(channelsToRender.askPassword, true),
    sendSettings: (settings: IUserPreferences) => localMainWindow.webContents.send(channelsToRender.setSettings, JSON.stringify(settings)),
    hideWindow: () => {
        localMainWindow.hide()
        localMainWindow.webContents.send(channelsToRender.hide, true)
    },
    unhide: () => {
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

        if (userPreferences.enableAutoPaste.value) {
            await action.pasteItem()
        }
    },
    async pasteItem() {
        if (!AppSettings.enablePaste) return

        if (state.ctrlA) {
            await robot.keyTap('backspace')

            state.ctrlA = false
        }
        if (userPreferences.minimizeAfterPaste.value) action.hideWindow()

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
        if (hash === state.lastHash || !text || text === '') return undefined
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
            action.sendSettings(userPreferences)
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
                    action.sendSettings(userPreferences)
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
        }
    },
    {
        name: 'unhide',
        handler: async (event: IpcMainEvent, value: boolean) => await action.unhide()
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
export let messageFromRenderer: IpcMain

async function InitIOHook(ipcMain: IpcMain, clipboard: Clipboard, mainWindow: BrowserWindow) {
    localClipboard = clipboard
    localMainWindow = mainWindow
    messageFromRenderer = ipcMain

    await InitUserSettings()

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
