import { IClipboardItem } from '../DataModels/DataTypes'
import { CryptoService } from '../Utils/CryptoService'

const items: Map<string, IClipboardItem> = new Map()

const getAll = (): Map<string, IClipboardItem> => items

const add = (item: IClipboardItem, password: string): IClipboardItem => {
    item.contentHash = CryptoService.ContentHash(item.content, password)
    const exists = get(item.contentHash)
    if (exists) {
        exists.lastModified = item.created
        items.set(item.contentHash, exists)
        return exists
    }
    items.set(item.contentHash, item)
    return item
}

const update = (item: IClipboardItem): boolean => {
    const exists = get(item.contentHash)
    if (exists) {
        items.set(item.contentHash, item)
        return true
    }
    return false
}

const remove = (item: IClipboardItem): boolean => {
    const exists = get(item.contentHash)
    if (exists) {
        items.delete(item.contentHash)
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

const checkForOldItems = (maxAgeInSeconds: number): boolean => {
    let changed = false
    const maxAge = new Date(new Date().getTime() - maxAgeInSeconds * 1000)
    for (const [hash, item] of items) {
        if (item.lastModified.getTime() < maxAge.getTime()) {
            if (item.isFavourite) continue
            remove(item)
            changed = true
        }
    }
    return changed
}

function limitMapSize(maxSize: number): boolean {
    const toDelete = []
    let i = 0
    for (const [key, value] of items.entries()) {
        if (!value.isFavourite) {
            toDelete[i++] = key
        }
    }
    let changed = false
    toDelete.sort((a, b) => items.get(a)!.created.getTime() - items.get(b)!.created?.getTime())
    while (items.size > maxSize && toDelete.length > 0) {
        changed = true
        items.delete(toDelete.shift() ?? '')
    }
    return changed
}

export const cleanUp = (maxAgeInSeconds: number, maxNumberTotal: number): boolean => {
    let changed = false
    changed = changed || checkForOldItems(maxAgeInSeconds)
    changed = changed || limitMapSize(maxNumberTotal)
    return changed
}

export const ItemRepo = {
    add,
    get,
    update,
    remove,
    exists,
    getAll,
    cleanUp
}
