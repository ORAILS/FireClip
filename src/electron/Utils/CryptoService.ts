import CryptoJS from 'crypto-js'
import { IClipboardItem, IClipboardItemEncrypted, RemoteItemStatus } from '../DataModels/DataTypes'
import { ILocalUser } from '../DataModels/LocalTypes'

const EncryptText = (text: string, password: string): string => {
    return CryptoJS.AES.encrypt(text, password, {
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7
    }).toString()
}

const DecryptText = (text: string, password: string): string => {
    return CryptoJS.AES.decrypt(text, password, {
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8)
}

const EncryptItem = (item: IClipboardItem, password: string): IClipboardItemEncrypted => {
    const encrypted = EncryptText(item.content, password)
    const result = {
        ...item,
        content: undefined,
        encryptedContent: encrypted,
        created: item.created.toISOString(),
        modified: item.modified.toISOString()
    }
    return result
}

const DecryptItem = (item: IClipboardItemEncrypted, password: string): IClipboardItem => {
    const decrypted = DecryptText(item.encryptedContent, password)
    const result = {
        ...item,
        encryptedContent: undefined,
        content: decrypted,
        remoteStatus: RemoteItemStatus.fetchedFromRemote,
        created: new Date(item.created),
        modified: new Date(item.modified)
    }
    // console.log(JSON.stringify(item, undefined, 2))
    return result
}

const ContentHash = (content: string, password: string) => CryptoJS.SHA256(CryptoJS.SHA256(password) + content).toString(CryptoJS.enc.Hex)

const HashUserLocal = (user: { name: string; password: string }): ILocalUser => {
    // generating salt from email
    const salt = CryptoJS.SHA512(user.name).toString(CryptoJS.enc.Hex)
    // salting and hashing user password
    const masterKey = CryptoJS.PBKDF2(user.password, salt, {
        iterations: 10001,
        keySize: 256 / 32
    }).toString(CryptoJS.enc.Hex)

    const masterKeyHashedSalted = CryptoJS.PBKDF2(masterKey, salt, {
        iterations: 10001,
        keySize: 256 / 32
    }).toString(CryptoJS.enc.Hex)

    const hashed: ILocalUser = {
        name: user.name,
        // used only locally for encryption
        masterKey: masterKey,
        // used to auth on remote server
        remotePassword: masterKeyHashedSalted
    }
    return hashed
}

// const HashUserRemote = (user: ILocalUser): IRemoteUser => {
//     if (user.password.length > 0) user = HashUserLocal(user)
//     // hashing master password, used for authenticating.
//     const masterPasswordHash = CryptoJS.SHA256(user.masterKey + CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex)).toString(
//         CryptoJS.enc.Base64url
//     )
//     return {
//         ...user,
//         masterPasswordHash
//     }
// }

export const CryptoService = {
    EncryptText,
    DecryptText,
    EncryptItem,
    DecryptItem,
    HashUserLocal,
    // HashUserRemote,
    ContentHash
}
