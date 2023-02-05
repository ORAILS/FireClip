import { IClipboardItem } from '../DataModels/DataTypes'
import { CryptoService } from '../Utils/CryptoService'

let items: Map<string, IClipboardItem> = new Map()

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

const checkForOldItems = (maxAgeInSeconds: number) => {
    const maxAge = new Date(new Date().getTime() - maxAgeInSeconds * 1000)
    console.log(maxAge)
    for (const [hash, item] of items) {
        if (item.lastModified.getTime() < maxAge.getTime()) {
            if (item.isFavourite) continue
            console.log(item)
            console.log('should be deleted')
        }
    }
}

function limitMapSize(map: Map<string, IClipboardItem>, maxSize: number) {
    const entries = Array.from(map.entries())
    const diff = entries.length - maxSize
    // if the difference is not big, not worth the effort
    if (diff < 1) return
    const favorites = entries.filter(([_, value]) => value.isFavourite)
    if (favorites.length >= maxSize) return new Map(favorites)

    const nonFavorites = entries.filter(([_, value]) => !value.isFavourite)
    nonFavorites.sort((a, b) => a[1].lastModified.getTime() - b[1].lastModified.getTime())
    const limitedNonFavorites = nonFavorites.slice(Math.max(nonFavorites.length - maxSize + favorites.length, 0))

    return new Map(favorites.concat(limitedNonFavorites))
}

// setInterval(() => {
//     checkForOldItems(2 * 24 * 60 * 60)
//     const newItems = limitMapSize(items, 10)
//     if (newItems) {
//         items = newItems
//     }
//     console.log(Array.from(items.entries()).length)
// }, 30 * 1000)

export const ItemRepo = {
    add,
    get,
    update,
    remove,
    exists,
    getAll
}
