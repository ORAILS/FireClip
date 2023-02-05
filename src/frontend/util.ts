export const ipcRenderer = window.require('electron').ipcRenderer

export const delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms))
}
