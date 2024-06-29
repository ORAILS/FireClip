import stringify from 'json-stable-stringify'


// export interface IItemsDb {
//     Add(item: IClipboardItemEncrypted): Promise<IClipboardItemEncrypted>
//     GetRange(start: number, end: number): Promise<IClipboardItemEncrypted[]>
//     Update(item: IClipboardItemEncrypted): Promise<boolean>
//     Delete(id: number): Promise<boolean>
//     Get(id: number): Promise<IClipboardItemEncrypted>
//     GetLastN(n: number): Promise<IClipboardItemEncrypted[]>
//     GetCount(): Promise<number>
//     LoadPreviousN(n: number, currentNumber: number): Promise<IClipboardItemEncrypted[]>
//     Exists(hash: string): Promise<boolean>
// }

// export interface IRemoteItemsDb extends IItemsDb {
//     CreateMany(items: IClipboardItemEncrypted[]): Promise<IBulkAddResponse[]>
//     GetAllSince(year: number, month: number, day: number, hour: number): Promise<IClipboardItemEncrypted[]>
//     GetAllInterval(
//         startYear: number,
//         startMonth: number,
//         startDay: number,
//         endYear: number,
//         endMonth: number,
//         endDay: number
//     ): Promise<IClipboardItemEncrypted[]>
//     GetByIdArray(array: number[]): Promise<IClipboardItemEncrypted[]>
//     GetIdsRange(start: number, end: number): Promise<number[]>
//     GetAllSinceId(id: number): Promise<IClipboardItemEncrypted[]>
//     ExistsIds(ids: number[]): Promise<number[]>
// }

// export interface IItemsDecryptedDB {
//     AddItem(item: IClipboardItem): Promise<boolean>
//     AddContent(content: string, type: 0 | 1 | 2): Promise<boolean>
//     GetItem(id: number): Promise<IClipboardItem>
//     Exists(hash: string): Promise<boolean>
//     FindByHash(hash: string): Promise<IClipboardItem | undefined>
//     DeleteItem(id: number): Promise<boolean>
//     UpdateItem(item: IClipboardItem): Promise<boolean>
//     CopiedAgain(item: IClipboardItem): Promise<boolean>
//     ItemUsed(id: number): Promise<boolean>
//     textSearched(text: string): Promise<IClipboardItem[]>
//     LoadPreviousN(n: number, currentNumber: number): Promise<IClipboardItem[]>
// }

interface ItemBase {
    /**
     * -1 - deleted - content is '' (empty)
     * 1 - rtf
     * 2 - text
     * 3 - image
     */
    contentType: -1 | 1 | 2 | 3
    // remoteId: number
    isFavorite: boolean
    /**
     * hash(hash(encryption key)+content)
     */
    hash: string
}

export enum RemoteItemStatus {
    fetchedFromRemote = 0,
    pushedToRemote = 1,
    existsOnlyLocally = 2,
    needsUpdateOnRemote = 3
}

export interface IClipboardItem extends ItemBase {
    content: string;
    created: Date
    modified: Date
    remoteStatus: RemoteItemStatus
}

export interface IClipboardItemEncrypted extends ItemBase {
    encryptedContent: string
    created: string
    modified: string
}

export function isTextContent(obj: ItemBase) {
    return obj.contentType === 2
}
export function isRTFContent(obj: ItemBase) {
    return obj.contentType === 1
}
export function isImageContent(obj: ItemBase) {
    return obj.contentType === 3
}

export const ObjectsAreEqual = <T>(item1: T, item2: T) => {
    return stringify(item1) === stringify(item2)
}
