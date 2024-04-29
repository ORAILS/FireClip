interface AppSettings {
    name: string
    openDevTools: boolean
    enableDevTools: boolean
    enablePaste: boolean
    widthWithDevTools: number
    heightWithDevTools: number
    widthNormal: number
    heightNormal: number
    isLinux: boolean
    isMac: boolean
    isWin: boolean
}

const linuxPlatform = ['freebsd', 'linux', 'openbsd']
const macPlatform = ['darwin']
const winPlatform = ['win32']

export const AppSettings: AppSettings = {
    name: 'FireClip',
    openDevTools: false,
    enableDevTools: false,
    enablePaste: true,
    widthNormal: 600,
    heightNormal: 400,
    widthWithDevTools: 900,
    heightWithDevTools: 800,
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
