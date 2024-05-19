import { BrowserWindow, Clipboard, dialog, IpcMain, nativeImage } from 'electron'
import { IpcMainEvent } from 'electron/main'
import * as fs from 'fs'
import { DateTime } from 'luxon'
import { ItemRepo } from '../Data/ItemRepository'
import { login, RequestService } from '../Data/Requests'
import { IClipboardItem, isImageContent, isRTFContent, isTextContent, RemoteItemStatus } from '../DataModels/DataTypes'
import { IAppState, IKeyboardEvent, IMouseEvent, IReceiveChannel } from '../DataModels/LocalTypes'
import { CryptoService } from '../Utils/CryptoService'
import { JsUtil } from '../Utils/JsUtil'
import { AppSettings } from './AppSettings'
import { InitUserSettings, IUserPreferences, store, userPreferences } from './UserPreferences'

const shortcutsKey = `fileclip.shortcuts`

export const state: IAppState = {
    pullInterval: undefined,
    remoteSyncInterval: undefined,
    // index: 0,
    // ctrlA: false,
    // last: 0,
    // last2: 0,
    // last3: 0,
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

export const handleCleanUpParameterChange = async () => {
    console.log("CLEANUP CALLED")
    if (cleanUpInterval) {
        clearInterval(cleanUpInterval)
    }
    const cleanUp = async () => {
        console.log('Cleaning started')
        const wasCleaned = await items()?.cleanUp(userPreferences.maxClipAgeInHours.value * 60 * 60, userPreferences.maxNumberOfClips.value)
        if (wasCleaned) {
            console.log('Was cleaned!')
            action.loadItems()
        }
    }
    cleanUpInterval = setInterval(cleanUp, 5 * 60 * 1000)
    await cleanUp()
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
    sendShortcuts: () => localMainWindow.webContents.send(channelsToRender.setShortcuts, store.get(shortcutsKey)),
    hideWindow: () => {
        localMainWindow.hide()
        localMainWindow.webContents.send(channelsToRender.hide, true)
    },
    unhide: () => {
        localMainWindow.showInactive()
        localMainWindow.webContents.send(channelsToRender.unhide, true)
    },
    resetSearch() {
        localMainWindow.webContents.send(channelsToRender.searchReset, true)
    },
    sendItems(itemList: Map<string, IClipboardItem> | undefined, resetSearchField?: boolean) {
        localMainWindow.webContents.send(channelsToRender.loadItems, itemList)
        // resetItemIndex ? action.resetIndex() : null
        resetSearchField ? action.resetSearch() : null
    },
    loadItems: async () => {
        try {
            action.sendItems(await items()?.getAll(), true)
        } catch (error) {
            console.log(error)
        }
    },
    async startClipboardPooling() {
        if (state.pullInterval) return
        state.pullInterval = setInterval(async () => await action.TrySaveClipboard(10), 200)
    },
    async startRemoteSync(interval: number) {
        if (state.remoteSyncInterval) return
        if (!state.user || !state.user.masterKey) {
            return
        }
        const sync = async () => {
            const now = DateTime.now().toUnixInteger()
            console.log(`Started syncing`)
            await ItemRepo.syncWithRemote(state.user?.masterKey as string)
            console.log(`Sync took ${DateTime.now().toUnixInteger() - now} seconds`)
        }
        await sync()
        state.remoteSyncInterval = setInterval(sync, interval)
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
        if (userPreferences.minimizeAfterPaste.value) action.hideWindow()
    },
    getClipboardItem: async (): Promise<IClipboardItem | undefined> => {
        if (state.user === undefined) {
            action.askPassword()
            return
        }

        const newItem: IClipboardItem = {
            contentType: 1,
            // remoteId: -1,
            isFavorite: false,
            created: new Date(),
            modified: new Date(),
            hash: '',
            content: '',
            remoteStatus: RemoteItemStatus.existsOnlyLocally
        }

        const base64Png = localClipboard.readImage().toDataURL()
        if (base64Png.length > 23) {
            const hash = CryptoService.ContentHash(base64Png, state.user.masterKey)
            if (hash === state.lastHash) return undefined
            newItem.content = base64Png
            newItem.hash = hash
            newItem.contentType = 3
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
        newItem.hash = hash
        newItem.contentType = 2
        return newItem
    },

    TrySaveClipboard: async (delayMs: number) => {
        // TODO check if was inited
        await JsUtil.waitforme(delayMs)

        const item = await action.getClipboardItem()
        if (!item) return
        state.lastHash = item.hash
        await items()?.add(item, state.user?.masterKey as string)
        action.loadItems()
    },
    logout: () => {
        RequestService.account.logout()
        clearInterval(state.remoteSyncInterval)
        state.remoteSyncInterval = undefined;
        ItemRepo.reset()
        action.sendItems(ItemRepo.getAll())
        state.user = undefined
        action.askPassword()
    },
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

async function loginUser(user: { name: string, password: string }) {
    try {
        console.log(user)
        const hashed = CryptoService.HashUserLocal(user)
        state.user = hashed
        console.log('hashed')
        console.log(state.user)

        const ok = await login()
        console.log(ok)
        if (ok) {
            action.startClipboardPooling()
            if (userPreferences.enableRemoteSync.value) {
                action.startRemoteSync(userPreferences.remoteSyncInterval.value)
            }
            action.loadItems()
            action.sendSettings(userPreferences)
            action.sendShortcuts()
            localMainWindow.webContents.send(channelsToRender.passwordConfirmed, true)
        }
    } catch (e) {
        console.log(e)
    }
}

async function registerUser(user: { name: string, password: string }) {
    try {
        console.log(user)
        const hashed = CryptoService.HashUserLocal(user)
        state.user = hashed
        const ok = await RequestService.account.register(hashed.name, hashed.remotePassword)
        console.log(ok)
        if (ok) {
            localMainWindow.webContents.send(channelsToRender.registerOk)
        }
    } catch (e) {
        console.log(e)
    }
}

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
        name: 'loginUser',
        handler: async (event: IpcMainEvent, user: { name: string; password: string }) => {
            await loginUser(user)
        }
    },
    {
        name: 'registerUser',
        handler: async (event: IpcMainEvent, user: { name: string; password: string }) => {
            await registerUser(user)
        }
    },
    {
        name: 'RendererInit',
        handler: () => action.askPassword()
    },
    {
        name: 'paste',
        handler: async (event: IpcMainEvent, hash: string) => await action.writeToClipboard(hash)
    },
    {
        name: 'delete',
        handler: async (event: IpcMainEvent, hash: string) => {
            await ItemRepo.remove(hash)
            await action.loadItems()
        }
    },
    {
        name: 'add_favorite',
        handler: async (event: IpcMainEvent, hash: string) => {
            const item = await ItemRepo.get(hash)
            item!.isFavorite = !item?.isFavorite
            item!.modified = new Date()
            item!.remoteStatus = RemoteItemStatus.needsUpdateOnRemote
            await ItemRepo.update(item!)
            await action.loadItems()
        }
    },
    {
        name: 'load_before',
        handler: async (event: IpcMainEvent, hash: string) => {
            console.log(`requested load before ${hash}`)
            await ItemRepo.loadItemsBeforeHash(hash, state.user?.masterKey as string)
        }
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
    },
    {
        name: 'to.backend.set.shortcuts',
        handler: async (event: IpcMainEvent, shortcuts: string) => {
            // console.log(shortcuts)
            store.set(shortcutsKey, shortcuts)
        }
    },
    {
        name: 'to.backend.user.logout',
        handler: () => {
            action.logout()
        }
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
    registerOk: 'registerOk',
    /**
     * used to set a state in the front end
     */
    unhide: 'unhide',
    setSettings: 'to.renderer.set.settings',
    setShortcuts: 'to.renderer.set.shortcuts'
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

    // action.resetIndex()

    await handleCleanUpParameterChange()
}

export const ioHookHandler = {
    InitIOHook
}
