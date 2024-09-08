import { DateTime } from "luxon"
import fetch from 'node-fetch'
import { actionsExported } from "../App/EventHandler"
import { IClipboardItemEncrypted } from "../DataModels/DataTypes"
import { BulkRes, CommonRes, LoginRes, RefreshRes, RegisterRes } from "../DataModels/RequestTypes"
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
    const result: ResWrapped<T> = {
        ok: res.ok,
        code: res.status
    }
    if (res.ok) {
        result.data = await res.json() as T
    } else {
        result.err = await res.text()
    }
    // console.log(result)
    return result
}

async function getAccessToken(): Promise<string> {
    if (DateTime.now().plus({ minute: 1 }) > userTokens.access_expires) {
        console.log("access token needs a refresh!")
        const refreshRes = await RequestService.account.refresh()
        if (refreshRes.ok && refreshRes.data) {
            userTokens.access_expires = DateTime.now().plus({ minutes: 55 })
            userTokens.access = refreshRes.data.access_token
        } else {
            actionsExported.askPassword()
        }
    }
    if (!userTokens.access) {
        actionsExported.logFrontend("Tried to call using an empty token!")
        throw new Error("token not set")
    }
    return userTokens.access
}

async function requestToken(url: string, method: string = "GET", body?: object) {
    return await request(url, method, body, { 'authorization': `Bearer ${await getAccessToken()}` })
}

async function requestTokenBody<T>(url: string, method: string = "GET", body?: object) {
    return requestWithResponseBody<T>(url, method, body, { 'authorization': `Bearer ${await getAccessToken()}` })
}

export const RequestService = {
    account: {
        register: (username: string, remotePass: string) => requestWithResponseBody<RegisterRes>(UserEndpoints.Register, "POST", { username, password: remotePass }),
        login: (username: string, remotePass: string, code2fa: string) => requestWithResponseBody<LoginRes>(UserEndpoints.Login, "POST", { username, password: remotePass, code: code2fa }),
        refresh: () => requestWithResponseBody<RefreshRes>(UserEndpoints.RefreshToken, "POST", undefined, { "authorization": `Bearer ${userTokens.refresh}` }),
        logout() {
            userTokens.refresh = undefined
            userTokens.access = undefined
            userTokens.access_expires = DateTime.now()
        },
        delete: () => requestTokenBody<CommonRes>(UserEndpoints.DeleteProfile, 'DELETE'),
        databaseDownloadUrl: async (): Promise<string> => {
            const url = ClipsEndpoints.GetDatabaseFile() + `?token=${await getAccessToken()}`
            return url
        },
        confirm2fa: (code: string, token: string) => requestWithResponseBody<CommonRes>(UserEndpoints.Confirm2FA, "POST", {
            code
        }, { "authorization": `Bearer ${token}` })
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