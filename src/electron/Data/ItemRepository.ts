import { DateTime } from 'luxon'
import { action, state } from '../App/EventHandler'
import { IClipboardItem, RemoteItemStatus } from '../DataModels/DataTypes'
import { CryptoService } from '../Utils/CryptoService'
import { RequestService } from './Requests'

const items: Map<string, IClipboardItem> = new Map()

const getAll = (): Map<string, IClipboardItem> => {
    return items
}

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

const removeByHash = async (hash: string): Promise<boolean> => {
    const exists = get(hash)
    if (exists) {
        return await remove(exists)
    }
    return false
}


const remove = async (item: IClipboardItem): Promise<boolean> => {
    const exists = get(item.hash)
    if (exists) {
        items.delete(item.hash)
        await RequestService.clips.delete(item.hash)
        return true
    }
    return false
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
            remove(item)
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
        await removeByHash(hash)
    }
    return changed
}

let oldestPull = DateTime.now().minus({ months: 2 })

export const ItemRepo = {
    add,
    get,
    update,
    remove,
    exists,
    getAll,
    cleanUp: async (maxAgeInSeconds: number, maxNumberTotal: number): Promise<boolean> => {
        let changed = false
        changed = changed || await removeOldUnfavored(maxAgeInSeconds)
        changed = changed || await limitMapSize(maxNumberTotal)
        return changed
    },
    syncWithRemote: async (password: string) => {
        const res = await RequestService.clips.getSince(oldestPull)
        oldestPull = DateTime.now().minus({ seconds: 10 })
        if (!state.user) {
            throw new Error("user not found")
        }
        for (const clip of res.clips) {
            try {
                const decrypted = CryptoService.DecryptItem(clip, state.user?.masterKey)
                items.set(clip.hash, decrypted)
            } catch (error) {
                console.log(clip)
                console.log(error)
            }
        }

        for (const item of items) {
            if (item[1].remoteStatus == RemoteItemStatus.existsOnlyLocally) {
                const encrypted = CryptoService.EncryptItem(item[1], password)
                const res = await RequestService.clips.add(encrypted)
                if (res.status == 200) {
                    item[1].remoteStatus = RemoteItemStatus.pushedToRemote
                } else if (res.status == 409) {
                    item[1].remoteStatus = RemoteItemStatus.needsUpdateOnRemote
                }
                else {
                    console.log(await res.text())
                }
            }
            if (item[1].remoteStatus == RemoteItemStatus.needsUpdateOnRemote) {
                const encrypted = CryptoService.EncryptItem(item[1], password)
                const res = await RequestService.clips.update(encrypted)
                if (res.status == 200) {
                    item[1].remoteStatus = RemoteItemStatus.pushedToRemote
                } else {
                    console.log(await res.text())
                }
            }
        }
        action.loadItems()
    }
}
