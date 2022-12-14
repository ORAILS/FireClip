import { IpcMainEvent } from 'electron/main'

interface AppSettings {
    name: string
    isDev: boolean
    openDevTools: boolean
    enableDevTools: boolean
    enablePaste: boolean
    closeOnPaste: boolean
    widthWithDevTools: number
    heightWithDevTools: number
    widthNormal: number
    heightNormal: number
    isLinux: boolean
    isMac: boolean
    isWin: boolean
}

/**
 * Used to store user settings. Naming the values is important as they are used for displaying to the user.
 */

export interface IUserSettings {
    // darkMode: IUserSetting<boolean>
    regiserCommandNumberShortcuts: IUserSetting<boolean>
    showCommandNumberIcons: IUserSetting<boolean>
    autoRestartOnUpdateAvailable: IUserSetting<boolean>
}

/**
 * User preference object
 */

export interface IUserSetting<T> {
    description: string
    value: T
    changeHandler: (event: IpcMainEvent, data: any) => Promise<void> | void
}

const linuxPlatform = ['freebsd', 'linux', 'openbsd']
const macPlatform = ['darwin']
const winPlatform = ['win32']

export const AppSettings: AppSettings = {
    name: 'FireClip',
    isDev: false,
    openDevTools: false,
    enableDevTools: false,
    enablePaste: true,
    closeOnPaste: true,
    widthNormal: 250,
    heightNormal: 400,
    widthWithDevTools: 600,
    heightWithDevTools: 400,
    isLinux: contains(linuxPlatform, process.platform),
    isMac: contains(macPlatform, process.platform),
    isWin: contains(winPlatform, process.platform)
}

export const WindowSettings = {
    title: AppSettings.name,
    width: AppSettings.openDevTools ? AppSettings.widthWithDevTools : AppSettings.widthNormal,
    height: AppSettings.openDevTools ? AppSettings.heightWithDevTools : AppSettings.heightNormal,
    frame: false,
    backgroundColor: '#FFF'
}

function contains(array: string[], item: string) {
    return array.find((i) => i === item) != undefined
}

export interface INetworkSettings {
    authServerUrl: string
    dataServerUrl: string
}

export const NetworkSettings: INetworkSettings = {
    authServerUrl: 'http://localhost:3006',
    dataServerUrl: 'http://localhost:3007'
}
