import { DateTime } from "luxon"
import fetch from 'node-fetch'
import { actionsExported } from "../App/EventHandler"
import { IClipboardItemEncrypted } from "../DataModels/DataTypes"
import { BulkRes, CommonRes, LoginRes } from "../DataModels/RequestTypes"
import { CryptoService } from "../Utils/CryptoService"
import { ClipsEndpoints, UserEndpoints } from "./RequestUtils"

export const userTokens: Tokens = {
    access_expires: DateTime.now()
}

type Tokens = {
    refresh?: string
    access?: string
    access_expires: DateTime<true>
}

function request(url: string, method: string = "GET", body?: object, headers?: Record<string, string>) {
    if (!headers) {
        headers = {}
    }
    if (body) {
        headers["content-type"] = "application/json"
    }

    const opts = {
        method,
        headers,
        body: JSON.stringify(body)
    }

    return fetch(url, opts)
}

type ResWrapped<T> = {
    ok: boolean,
    data?: T,
    err?: string
    code: number
}

async function requestWithResponseBody<T>(url: string, method: string = "GET", body?: object, headers?: Record<string, string>): Promise<ResWrapped<T>> {
    const res = await request(url, method, body, headers)
    console.log(headers)
    const result: ResWrapped<T> = {
        ok: res.ok,
        code: res.status
    }
    if (res.ok) {
        result.data = await res.json() as T
    } else {
        result.err = await res.text()
    }
    console.log(result)
    return result
}

async function getAccessToken(): Promise<string> {
    // if (DateTime.now().minus({ minute: 1 }) > userTokens.access_expires) {
    //     if (!state.user) {
    //         actionsExported.alertFrontend("User not set but tried to request a token!")
    //         throw new Error("user not set")
    //     }
    //     const token = await RequestService.account.login(state.user.name, state.user.remotePassword)
    //     userTokens.access_expires = DateTime.now().plus({ minutes: 55 })
    //     if (token.ok && token.data) {
    //         userTokens.access = token.data.access_token
    //         userTokens.refresh = token.data.refresh_token
    //     }
    // }
    if (!userTokens.access) {
        actionsExported.alertFrontend("Cannot return emtpty token!")
        throw new Error("user not set")

    }
    return userTokens.access
}

// export async function login() {
//     const res = await getToken()
//     if (res.length > 0) {
//         return true
//     }
//     return false
// }

async function requestToken(url: string, method: string = "GET", body?: object) {
    return await request(url, method, body, { 'authorization': `Bearer ${await getAccessToken()}` })
}

async function requestTokenBody<T>(url: string, method: string = "GET", body?: object) {
    return requestWithResponseBody<T>(url, method, body, { 'authorization': `Bearer ${await getAccessToken()}` })
}

export const RequestService = {
    account: {
        register: (username: string, remotePass: string) => requestWithResponseBody<CommonRes>(UserEndpoints.Register, "POST", { username, password: remotePass }),
        login: (username: string, remotePass: string) => requestWithResponseBody<LoginRes>(UserEndpoints.Login, "POST", { username, password: CryptoService.sha512hex(remotePass) }),
        logout() {
            userTokens.refresh = undefined
            userTokens.access = undefined
            userTokens.access_expires = DateTime.now()
        },
        delete: () => requestTokenBody<CommonRes>(UserEndpoints.DeleteProfile, 'DELETE'),
        accessToken: getAccessToken
    },
    clips: {
        add: (clip: IClipboardItemEncrypted) => requestToken(ClipsEndpoints.CreateUpdate, "POST", clip),
        upsert: (clip: IClipboardItemEncrypted) => requestToken(ClipsEndpoints.CreateUpdate, "PUT", clip),
        update: (clip: { isFavorite: boolean, hash: string }) => requestToken(ClipsEndpoints.CreateUpdate, "PATCH", clip),
        delete: (hash: string) => requestToken(ClipsEndpoints.Delete(hash), "DELETE"),
        getSince: (time: DateTime) => requestTokenBody<BulkRes>(ClipsEndpoints.GetAllSince(time), "GET"),
        getBetween: (start: DateTime, end: DateTime) => requestTokenBody<BulkRes>(ClipsEndpoints.GetInBetween(start, end), "GET"),
        getNBefore: (time: DateTime, limit: number) => requestTokenBody<BulkRes>(ClipsEndpoints.GetNBefore(time, limit), "GET"),
        deleteAll: () => requestTokenBody<CommonRes>(ClipsEndpoints.DeletAllData(), "DELETE"),
    }
}