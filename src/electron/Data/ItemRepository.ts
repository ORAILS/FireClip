import { DateTime } from 'luxon'
import { messages } from '../App/CommunicationMessages'
import { actionsExported, state } from '../App/EventHandler'
import { IClipboardItem, RemoteItemStatus } from '../DataModels/DataTypes'
import { CryptoService } from '../Utils/CryptoService'
import { RequestService } from './Requests'

let items: Map<string, IClipboardItem> = new Map()

const getAll = (): Map<string, IClipboardItem> => {
    return items
}

let deletedHashes: string[] = []

const add = async (item: IClipboardItem, password: string): Promise<IClipboardItem> => {
    item.hash = CryptoService.ContentHash(item.content, password)
    console.log(items.size)
    const exists = get(item.hash)
    if (exists) {
        exists.modified = item.created
        exists.remoteStatus = RemoteItemStatus.needsUpdateOnRemote
        items.set(item.hash, exists)
        return exists
    }
    items.set(item.hash, item)
    console.log(items.size)
    ItemRepo.syncWithRemote(password)
    return item
}

const update = (item: IClipboardItem): boolean => {
    const exists = get(item.hash)
    if (exists) {
        items.set(item.hash, item)
        return true
    }
    return false
}


const remove = async (hash: string) => {
    items.delete(hash)
    await RequestService.clips.delete(hash)
}

const get = (itemHash: string): IClipboardItem | undefined => {
    return items.get(itemHash)
}

const exists = (itemHash: string): boolean => {
    return get(itemHash) !== undefined
}

const removeOldUnfavored = async (maxAgeInSeconds: number): Promise<boolean> => {
    let changed = false
    const maxAge = DateTime.now().toUTC().minus({ seconds: maxAgeInSeconds })
    for (const [hash, item] of items) {
        if (item.modified.getTime() < maxAge.toMillis()) {
            if (item.isFavorite) continue
            remove(item.hash)
            changed = true
        }
    }
    return changed
}

const limitMapSize = async (maxSize: number): Promise<boolean> => {
    const toDelete = []
    let i = 0
    for (const [key, value] of items.entries()) {
        if (!value.isFavorite) {
            toDelete[i++] = key
        }
    }
    let changed = false
    toDelete.sort((a, b) => items.get(a)!.created.getTime() - items.get(b)!.created?.getTime())
    while (items.size > maxSize && toDelete.length > 0) {
        changed = true
        const hash = toDelete.shift()
        if (!hash) {
            continue
        }
        await remove(hash)
    }
    return changed
}

let oldestPull = DateTime.now()

async function loadItemsBeforeDate(date: DateTime, limit: number, masterKey: string): Promise<boolean> {
    const res = await RequestService.clips.getNBefore(date, limit)
    if (!res.ok || !res.data) {
        actionsExported.alertFrontend(messages().generic.fail + `.\nFetch of items before ${date.toISO()}, limit ${limit}`)
        return false
    }
    let needsLoading = false
    if (!state.user) {
        throw new Error("user not found")
    }
    // console.log("received items: " + res.data.clips.length)
    for (const clip of res.data.clips) {
        needsLoading = true
        try {
            const decrypted = CryptoService.DecryptItem(clip, masterKey)
            items.set(clip.hash, decrypted)
        } catch (error) {
            const res = await remove(clip.hash)
            console.log(`was removed: ${res}`)
            console.log(clip)
            console.log(error)
        }
    }
    if (needsLoading) {
        console.log(`needs loading after pulling before ${date.toISO()}`)
        actionsExported.sendCurrentItems()
    }
    return needsLoading
}

export const ItemRepo = {
    reset: () => {
        deletedHashes = []
        items = new Map()
        oldestPull = DateTime.now()
    },
    add,
    get,
    update,
    remove,
    exists,
    getAll,
    initialLoadItems: async (password: string, limit = 50) => {
        loadItemsBeforeDate(DateTime.now(), limit, password)
    },
    loadItemsBeforeHash: async (hash: string, password: string, limit = 50) => {
        const item = items.get(hash)
        if (!item) {
            throw new Error("tried to read before unexisting hash!")
        }
        return loadItemsBeforeDate(DateTime.fromJSDate(item.modified), limit, password)
    },
    cleanUp: async (maxAgeInSeconds: number, maxNumberTotal: number): Promise<boolean> => {
        let changed = false
        changed = changed || await removeOldUnfavored(maxAgeInSeconds)
        changed = changed || await limitMapSize(maxNumberTotal)
        return changed
    },
    syncWithRemote: async (password: string) => {
        console.log("syncing")
        const res = await RequestService.clips.getSince(oldestPull)
        if (!res.ok || !res.data) {
            actionsExported.alertFrontend(messages().generic.fail + `.\nFetch of items since ${oldestPull.toISO()}.`)
            return
        }
        oldestPull = DateTime.now().minus({ minute: 1 })
        let needsLoading = false
        if (!state.user) {
            throw new Error("user not found")
        }
        console.log("received items: " + res.data.clips.length)
        for (const clip of res.data.clips) {
            needsLoading = true
            try {
                if (clip.contentType === -1) {
                    items.delete(clip.hash)
                    deletedHashes.push(clip.hash)
                    continue
                }
                const decrypted = CryptoService.DecryptItem(clip, password)
                items.set(clip.hash, decrypted)
            } catch (error) {
                const res = await remove(clip.hash)
                console.log(`failed to deserialize and was removed: ${res}`)
                console.log(clip)
                console.log(error)
            }
        }

        for (const item of items) {
            if (item[1].remoteStatus == RemoteItemStatus.existsOnlyLocally) {
                const encrypted = CryptoService.EncryptItem(item[1], password)
                const res = await RequestService.clips.upsert(encrypted)
                if (res.status == 200) {
                    item[1].remoteStatus = RemoteItemStatus.pushedToRemote
                } else if (res.status == 409) {
                    item[1].remoteStatus = RemoteItemStatus.needsUpdateOnRemote
                }
                else {
                    console.log(await res.text())
                }
                needsLoading = true
            }
            if (item[1].remoteStatus == RemoteItemStatus.needsUpdateOnRemote) {
                const encrypted = CryptoService.EncryptItem(item[1], password)
                const res = await RequestService.clips.update(encrypted)
                if (res.status == 200) {
                    item[1].remoteStatus = RemoteItemStatus.pushedToRemote
                } else {
                    console.log(await res.text())
                }
                needsLoading = true
            }
        }
        console.log('done syncing')
        if (needsLoading) {
            console.log("needs loading after remote sync")
            actionsExported.sendCurrentItems()
        }
    }
}
