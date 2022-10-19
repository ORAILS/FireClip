import stringify from 'json-stable-stringify'
import { IBulkAddResponse } from './ApiResponses'

export interface ILocalData {
    items: IClipboardItemEncrypted[]
    maxIndex: number
}

export interface IItemsDb {
    Add(item: IClipboardItemEncrypted): Promise<IClipboardItemEncrypted>
    GetRange(start: number, end: number): Promise<IClipboardItemEncrypted[]>
    Update(item: IClipboardItemEncrypted): Promise<boolean>
    Delete(id: number): Promise<boolean>
    Get(id: number): Promise<IClipboardItemEncrypted>
    GetLastN(n: number): Promise<IClipboardItemEncrypted[]>
    GetCount(): Promise<number>
    LoadPreviousN(n: number, currentNumber: number): Promise<IClipboardItemEncrypted[]>
    Exists(hash: string): Promise<boolean>
}

export interface IRemoteItemsDb extends IItemsDb {
    CreateMany(items: IClipboardItemEncrypted[]): Promise<IBulkAddResponse[]>
    GetAllSince(year: number, month: number, day: number, hour: number): Promise<IClipboardItemEncrypted[]>
    GetAllInterval(
        startYear: number,
        startMonth: number,
        startDay: number,
        endYear: number,
        endMonth: number,
        endDay: number
    ): Promise<IClipboardItemEncrypted[]>
    GetByIdArray(array: number[]): Promise<IClipboardItemEncrypted[]>
    GetIdsRange(start: number, end: number): Promise<number[]>
    GetAllSinceId(id: number): Promise<IClipboardItemEncrypted[]>
    ExistsIds(ids: number[]): Promise<number[]>
}

export interface IItemsDecryptedDB {
    AddItem(item: IClipboardItem): Promise<boolean>
    AddContent(content: string, type: 0 | 1 | 2): Promise<boolean>
    GetItem(id: number): Promise<IClipboardItem>
    Exists(hash: string): Promise<boolean>
    FindByHash(hash: string): Promise<IClipboardItem | undefined>
    DeleteItem(id: number): Promise<boolean>
    UpdateItem(item: IClipboardItem): Promise<boolean>
    CopiedAgain(item: IClipboardItem): Promise<boolean>
    ItemUsed(id: number): Promise<boolean>
    textSearched(text: string): Promise<IClipboardItem[]>
    LoadPreviousN(n: number, currentNumber: number): Promise<IClipboardItem[]>
}

interface ItemBase {
    /**
     * 0 - image
     * 1 - rtf
     * 2 - text
     */
    type: 0 | 1 | 2
    remoteId: number
    isFavourite: boolean
    created: Date
    lastModified: Date
    /**
     * hash(hash(encryption key)+content)
     */
    contentHash: string
}

export interface IClipboardItem extends ItemBase {
    content: string
}

export interface IClipboardItemEncrypted extends ItemBase {
    encryptedContent: string
}

export function isTextContent(obj: ItemBase) {
    return obj.type === 2
}
export function isRTFContent(obj: ItemBase) {
    return obj.type === 1
}
export function isImageContent(obj: ItemBase) {
    return obj.type === 0
}

export const ObjectsAreEqual = <T>(item1: T, item2: T) => {
    return stringify(item1) === stringify(item2)
}
