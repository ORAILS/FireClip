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

export const ItemRepo = {
    add,
    get,
    update,
    remove,
    exists,
    getAll
}
