import { BrowserWindow, Clipboard, dialog, IpcMain, nativeImage } from 'electron'
import { IpcMainEvent } from 'electron/main'
import * as fs from 'fs'
import { DateTime } from 'luxon'
import { ItemRepo } from '../Data/ItemRepository'
import { RequestService, userTokens } from '../Data/Requests'
import { IClipboardItem, isImageContent, isRTFContent, isTextContent, RemoteItemStatus } from '../DataModels/DataTypes'
import { IAppState, IKeyboardEvent, IMouseEvent, IReceiveChannel, ISavedUser } from '../DataModels/LocalTypes'
import { CryptoService } from '../Utils/CryptoService'
import { JsUtil } from '../Utils/JsUtil'
import { AppSettings } from './AppSettings'
import { messages } from './CommunicationMessages'
import { clearUserData, getUserData, InitUserSettings, IUserPreferences, store, storeUserData, userPreferences } from './UserPreferences'

const shortcutsKey = `fileclip.shortcuts`

export const state: IAppState = {
    clipboardPullInterval: undefined,
    remoteSyncInterval: undefined,
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
        fs.writeFile(res.filePath, JSON.stringify(data, undefined, 2), 'utf8', (err) => {
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
    console.log('CLEANUP CALLED')
    if (cleanUpInterval) {
        clearInterval(cleanUpInterval)
    }
    const cleanUp = async () => {
        console.log('Cleaning started')
        const wasCleaned = await items()?.cleanUp(userPreferences.maxClipAgeInHours.value * 60 * 60, userPreferences.maxNumberOfClips.value)
        if (wasCleaned) {
            console.log('Was cleaned!')
            actionsExported.sendCurrentItems()
        }
    }
    cleanUpInterval = setInterval(cleanUp, 5 * 60 * 1000)
    await cleanUp()
}

const items = () => {
    if (state.user === undefined) {
        actionsExported.askPassword()
        return
    }
    return ItemRepo
}

export const actionsExported = {
    alertFrontend: (message: string) => {
        localMainWindow.webContents.send(channelsToRender.alert, message)
    },
    logFrontend: (message: string) => {
        localMainWindow.webContents.send(channelsToRender.log, message)
    },
    sendCurrentItems: async () => {
        try {
            actions.sendItems(items()?.getAll())
        } catch (error) {
            console.log(error)
        }
    },
    sendSettings: (settings: IUserPreferences) => actions.sendFrontendNotification(channelsToRender.setSettings, JSON.stringify(settings)),
    clearSyncInterval: () => {
        console.log('remote sync stopped!')
        clearInterval(state.remoteSyncInterval)
        state.remoteSyncInterval = undefined
    },
    async startRemoteSync(interval: number) {
        if (state.remoteSyncInterval) return
        console.log(`starting remote sync every ${interval} ms`)
        if (!state.user || !state.user.masterKey) {
            return
        }
        const sync = async () => {
            const now = DateTime.now().toMillis()
            console.log(`Started syncing`)
            await ItemRepo.syncWithRemote(state.user?.masterKey as string)
            console.log(`Sync took ${DateTime.now().toMillis() - now} ms`)
        }
        await ItemRepo.initialLoadItems(state.user.masterKey as string)
        state.remoteSyncInterval = setInterval(sync, interval)
    },
    askPassword: async () => {
        const saved = getUserData('savedUser')
        if (saved) {
            localMainWindow.webContents.send(channelsToRender.askPassword, true)
        } else {
            localMainWindow.webContents.send(channelsToRender.askPassword, false)
        }
    },
    openWindow: async (window: string) => localMainWindow.webContents.send(channelsToRender.openWindow, window)
}

const actions = {
    sendShortcuts: () => localMainWindow.webContents.send(channelsToRender.setShortcuts, store.get(shortcutsKey)),
    hideWindow: () => {
        localMainWindow.hide()
        localMainWindow.webContents.send(channelsToRender.hide, true)
    },
    unhide: () => {
        localMainWindow.showInactive()
        localMainWindow.webContents.send(channelsToRender.unhide, true)
    },
    sendItems(itemList: Map<string, IClipboardItem> | undefined) {
        localMainWindow.webContents.send(channelsToRender.loadItems, itemList)
    },
    async startClipboardPooling() {
        if (state.clipboardPullInterval) return
        state.clipboardPullInterval = setInterval(async () => await actions.TrySaveClipboard(10), 200)
    },
    async writeToClipboard(hash: string) {
        const result = items()?.get(hash)
        if (!result) throw new Error('Item not found')

        if (isTextContent(result)) localClipboard.writeText(result.content)
        if (isRTFContent(result)) localClipboard.writeRTF(result.content)
        if (isImageContent(result)) localClipboard.writeImage(nativeImage.createFromDataURL(result.content))

        if (userPreferences.enableAutoPaste.value) {
            await actions.pasteItem()
        }
    },
    async pasteItem() {
        if (!AppSettings.enablePaste) return
        if (userPreferences.minimizeAfterPaste.value) actions.hideWindow()
    },
    getClipboardItem: async (): Promise<IClipboardItem | undefined> => {
        if (state.user === undefined) {
            actionsExported.askPassword()
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

        const item = await actions.getClipboardItem()
        if (!item) return
        state.lastHash = item.hash
        await items()?.add(item, state.user?.masterKey as string)
        actionsExported.sendCurrentItems()
    },
    logout: () => {
        RequestService.account.logout()
        actionsExported.clearSyncInterval()
        clearInterval(state.clipboardPullInterval)
        ItemRepo.reset()
        actions.sendItems(ItemRepo.getAll())
        state.user = undefined
        clearUserData('savedUser')
        actionsExported.askPassword()
    },
    sendFrontendNotification: (notification: typeof channelsToRender[keyof typeof channelsToRender], ...args: any[]) => {
        localMainWindow.webContents.send(notification, ...args)
    }
}

// from FrontEnd , iohook specific
const ioHookChannels: IReceiveChannel[] = [
    {
        name: 'keydown',
        handler: async () => {
            await actions.TrySaveClipboard(50)
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

async function loginUser(rawUser: { name: string; password: string; code: string; wasRemembered: boolean; rememberLogin: boolean }) {
    try {
        if (rawUser.wasRemembered) {
            const data = JSON.parse(getUserData('savedUser')) as ISavedUser
            const localUser = CryptoService.HashUserLocal({ name: data.name, password: rawUser.password })
            try {
                const refresh = CryptoService.DecryptText(data.refresh, localUser.masterKey)
                userTokens.refresh = refresh
                console.log(refresh)
            } catch (error) {
                actionsExported.alertFrontend('password incorrect!')
                return
            }
            state.user = localUser
            // TODO add retries
            const refreshRes = await RequestService.account.refresh()
            if (refreshRes.ok && refreshRes.data) {
                userTokens.access_expires = DateTime.now().plus({ minutes: 55 })
                userTokens.access = refreshRes.data.access_token
            } else {
                actionsExported.alertFrontend('failed refresh the token. please try to log in again.')
                actions.logout()
            }
        } else {
            const localUser = CryptoService.HashUserLocal(rawUser)
            state.user = localUser

            const loginRes = await RequestService.account.login(localUser.name, localUser.remotePassword, rawUser.code)

            if (loginRes.code === 206) {
                if (loginRes.data) {
                    localMainWindow.webContents.send(channelsToRender.confirmTotp, loginRes.data)
                }
                return
            }
            if (loginRes.code === 400) {
                actionsExported.alertFrontend('2fa code incorrect!')
                return
            }
            if (loginRes.ok && loginRes.data) {
                userTokens.access_expires = DateTime.now().plus({ minutes: 55 })
                userTokens.access = loginRes.data.access_token
                userTokens.refresh = loginRes.data.refresh_token
                if (rawUser.rememberLogin) {
                    const saved: ISavedUser = {
                        refresh: CryptoService.EncryptText(userTokens.refresh, state.user.masterKey as string),
                        name: localUser.name
                    }
                    storeUserData('savedUser', JSON.stringify(saved))
                }
            } else {
                actionsExported.alertFrontend('password incorrect!')
            }
        }

        actions.startClipboardPooling()
        if (userPreferences.enableRemoteSync.value) {
            actionsExported.startRemoteSync(userPreferences.remoteSyncInterval.value * 1000)
        }
        actionsExported.sendCurrentItems()
        actionsExported.sendSettings(userPreferences)
        actions.sendShortcuts()
        actions.sendFrontendNotification(channelsToRender.passwordConfirmed)
        console.log('end of flow')
    } catch (e: any) {
        actionsExported.alertFrontend(e.toString())
        console.log(e)
    }
}

async function registerUser(rawUser: { name: string; password: string }) {
    try {
        const localUser = CryptoService.HashUserLocal(rawUser)
        state.user = localUser
        const registerRes = await RequestService.account.register(localUser.name, localUser.remotePassword)
        if (registerRes.ok) {
            const body = registerRes.data
            if (body) {
                localMainWindow.webContents.send(channelsToRender.confirmTotp, body)
            }
        } else {
            actionsExported.alertFrontend(messages().generic.fail + `.\nStatus: ${registerRes.code}`)
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
        name: 'to.backend.window.minimize',
        handler: () => actions.hideWindow()
    },
    /**
     * Event sent by the front-end to retreive the setting.
     */
    {
        name: 'to.backend.get.settings',
        handler: () => {
            actionsExported.sendSettings(userPreferences)
        }
    },
    {
        name: 'to.backend.get.shortcuts',
        handler: () => {
            console.log('got shortcuts')
            actions.sendShortcuts()
        }
    },
    {
        name: 'to.backend.save_clips',
        handler: async (event: IpcMainEvent) => {
            await saveJSONFile(Array.from(ItemRepo.getAll().entries()))
        }
    },
    {
        name: 'to.backend.user.login',
        handler: async (event: IpcMainEvent, user: any) => {
            await loginUser(user)
        }
    },
    {
        name: 'to.backend.user.register',
        handler: async (event: IpcMainEvent, user: { name: string; password: string }) => {
            await registerUser(user)
        }
    },
    {
        name: 'to.backend.user.logout',
        handler: () => {
            actions.logout()
        }
    },
    {
        name: 'to.backend.item.paste',
        handler: async (event: IpcMainEvent, hash: string) => await actions.writeToClipboard(hash)
    },
    {
        name: 'to.backend.text.paste',
        handler: async (event: IpcMainEvent, text: string) => {
            localClipboard.writeText(text)
            actionsExported.alertFrontend('copied!')
        }
    },
    {
        name: 'to.backend.item.delete',
        handler: async (event: IpcMainEvent, hash: string) => {
            await ItemRepo.remove(hash)
            await actionsExported.sendCurrentItems()
        }
    },
    {
        name: 'to.backend.item.add_favorite',
        handler: async (event: IpcMainEvent, hash: string) => {
            const item = await ItemRepo.get(hash)
            item!.isFavorite = !item?.isFavorite
            item!.modified = new Date()
            item!.remoteStatus = RemoteItemStatus.needsUpdateOnRemote
            await ItemRepo.update(item!)
            await actionsExported.sendCurrentItems()
        }
    },
    {
        name: 'to.backend.items.load_before_hash',
        handler: async (event: IpcMainEvent, hash: string) => {
            console.log(`requested load before ${hash}`)
            await ItemRepo.loadItemsBeforeHash(hash, state.user?.masterKey as string)
        }
    },
    {
        name: 'to.backend.window.focus',
        handler: async (event: IpcMainEvent) => {
            localMainWindow.show()
        }
    },
    {
        name: 'to.backend.window.unhide',
        handler: async (event: IpcMainEvent) => await actions.unhide()
    },
    {
        name: 'to.backend.set.shortcuts',
        handler: async (event: IpcMainEvent, shortcuts: string) => {
            // console.log(shortcuts)
            store.set(shortcutsKey, shortcuts)
        }
    },
    {
        name: 'to.backend.delete.allData',
        handler: async () => {
            const res = await RequestService.clips.deleteAll()
            console.log(res)
            actions.logout()
            if (res.ok) {
                actionsExported.alertFrontend(messages().dataDeleted.ok)
            } else {
                actionsExported.alertFrontend(`${messages().dataDeleted.fail}. Error code: ${res.code}`)
            }
        }
    },
    {
        name: 'to.backend.delete.allDataAndAccount',
        handler: async () => {
            const resDeleteItems = await RequestService.clips.deleteAll()
            const resDeleteAccount = await RequestService.account.delete()
            actions.logout()
            console.log(resDeleteItems)
            console.log(resDeleteAccount)
            if (resDeleteItems.ok && resDeleteAccount.ok) {
                actionsExported.alertFrontend(messages().accountAndDataDeleted.ok)
            } else {
                actionsExported.alertFrontend(
                    `${messages().dataDeleted.fail}.\n\nAccount deletion code: ${resDeleteAccount.code}.\nData deletion code: ${
                        resDeleteItems.code
                    }`
                )
            }
        }
    },
    {
        name: 'to.backend.get.dataDownloadLink',
        handler: async () => {
            const downloadUrl = await RequestService.account.databaseDownloadUrl()
            localClipboard.writeText(downloadUrl)
            actionsExported.alertFrontend(messages().downloadLinkWritten.ok)
        }
    },
    {
        name: 'to.backend.confirm.2fa',
        handler: async (event: any, code: string, token: string) => {
            const res = await RequestService.account.confirm2fa(code, token)
            if (res.ok) {
                actionsExported.alertFrontend('2FA successfully enabled! Try logging in')
                actionsExported.openWindow('login')
            } else {
                actionsExported.alertFrontend(`failed enabling 2FA. Code ${res.code}`)
            }
        }
    },
    {
        name: 'to.backend.frontendHandler.isReady',
        handler: async (event: any) => {
            actionsExported.askPassword()
        }
    }
]

/**
 * Events sent to the renderer (front-end)
 */
export const channelsToRender = {
    loadItems: 'to.renderer.loadItems',
    askPassword: 'to.renderer.askPassword',
    passwordConfirmed: 'to.renderer.passwordConfirmed',
    passwordIncorrect: 'to.renderer.error.passwordIncorrect',
    hide: 'to.renderer.hide',
    unhide: 'to.renderer.unhide',
    setSettings: 'to.renderer.set.settings',
    setShortcuts: 'to.renderer.set.shortcuts',
    alert: 'to.renderer.alert',
    openWindow: 'to.renderer.open.window',
    log: 'to.renderer.log',
    confirmTotp: 'to.renderer.confirm.totp'
} as const

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

    await handleCleanUpParameterChange()
}

export const ioHookHandler = {
    InitIOHook
}
