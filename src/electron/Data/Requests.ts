import CryptoJS from 'crypto-js'
import { DateTime } from "luxon"
import fetch from 'node-fetch'
import { state } from "../App/EventHandler"
import { IClipboardItemEncrypted } from "../DataModels/DataTypes"
import { CommonRes, LoginRes, SinceRes } from "../DataModels/RequestTypes"
import { ClipsEndpoints, UserEndpoints } from "./RequestUtils"

const tokens = {
    refresh: "",
    acess: "",
    access_expires: DateTime.now().minus({ hour: 1 })
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

function sha512hex(text: string): string {
    return CryptoJS.SHA512(text).toString(CryptoJS.enc.Hex)
}

async function requestWithResponseBody<T>(url: string, method: string = "GET", body?: object, headers?: Record<string, string>): Promise<T> {
    const res = await request(url, method, body, headers)
    if (res.ok) {
        return await res.json() as T
    }
    console.log(`${method} ${url}`)
    console.log(headers)
    throw new Error(await res.text())
}

async function getToken(): Promise<string> {
    if (DateTime.now() > tokens.access_expires) {
        if (!state.user) {
            throw new Error("user not set")
        }
        const token = await RequestService.account.login(state.user.name, state.user.masterKey)
        tokens.access_expires = DateTime.now().plus({ minutes: 55 })
        tokens.acess = token.access_token
        tokens.refresh = token.refresh_token
    }
    return tokens.acess
}

export async function login() {
    const res = await getToken()
    if (res.length > 0) {
        return true
    }
    return false
}

async function requestToken(url: string, method: string = "GET", body?: object) {
    // console.log(JSON.stringify(body, undefined, 2))
    // console.log(await getToken())
    return await request(url, method, body, { 'authorization': `Bearer ${await getToken()}` })
}

async function requestTokenBody<T>(url: string, method: string = "GET", body?: object) {
    const res = await requestToken(url, method, body)
    if (res.ok) {
        return await res.json() as T
    }
    throw new Error(await res.text())
}

export const RequestService = {
    account: {
        register: (username: string, password: string) => requestWithResponseBody<CommonRes>(UserEndpoints.Register, "POST", { username, password: sha512hex(password) }),
        login: (username: string, password: string) => requestWithResponseBody<LoginRes>(UserEndpoints.Login, "POST", { username, password: sha512hex(password) })
    },
    clips: {
        add: (clip: IClipboardItemEncrypted) => requestToken(ClipsEndpoints.CreateUpdate, "POST", clip),
        update: (clip: IClipboardItemEncrypted) => requestToken(ClipsEndpoints.CreateUpdate, "PUT", clip),
        delete: (hash: string) => requestToken(ClipsEndpoints.Delete(hash), "DELETE"),
        getSince: (time: DateTime) => requestTokenBody<SinceRes>(ClipsEndpoints.GetAllSince(time), "GET")
    }
}