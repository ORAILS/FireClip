import { app, BrowserWindow } from 'electron'
import EventEmitter from 'events'
import path from 'path'
import { AppSettings, WindowSettings } from './AppSettings'

class CustomWindow {
    window!: BrowserWindow
    onEvent: EventEmitter = new EventEmitter()

    createWindow(url: string) {
        const settings = { ...WindowSettings }
        app.name = AppSettings.name
        const window = new BrowserWindow({
            ...settings,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                devTools: AppSettings.enableDevTools,
                preload: path.join(__dirname, 'preload.js')
            },
            x: -1300,
            y: 335
        })

        window.setAlwaysOnTop(true, 'floating')
        window.setVisibleOnAllWorkspaces(true)
        window.setFullScreenable(false)

        window.loadURL('file://' + url).catch((err) => {
            console.error(JSON.stringify(err))
            app.quit()
        })

        window.once('ready-to-show', () => {
            window.show()
        })

        this.window = window
        return window
    }
}

export default CustomWindow
