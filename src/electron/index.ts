import { app, clipboard, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { AppSettings } from './App/AppSettings'
import CustomWindow from './App/CustomWindow'
import { ioHookHandler, userSettings } from './App/EventHandler'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('electron-reload')(__dirname)

let mainWindow: CustomWindow

app.on('ready', async () => {
    await createMainWindow()
    autoUpdater.setFeedURL('https://release.fireclip.net/download/latest')
    autoUpdater.checkForUpdatesAndNotify()

    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify()
    }, 5 * 60 * 1000)

    const iconPath = path.join(__dirname, 'www', 'icon16.png')
    const icon = nativeImage.createFromPath(iconPath)

    const appIcon = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Maximize',
            toolTip: 'Show application',
            click: () => {
                appIcon
                mainWindow.window.show()
            }
        },
        {
            label: 'Settings',
            toolTip: 'Open Settings',
            click: () => {
                appIcon
                mainWindow.window.show()
                mainWindow.window.webContents.send('to.renderer.open.window', 'settings')
            }
        },
        {
            label: 'Quit',
            toolTip: 'Close the application',
            click: () => {
                appIcon
                // if we don't want to close
                // mainWindow.window.close();
                app.quit()
            }
        }
    ])

    appIcon.setContextMenu(contextMenu)
    appIcon.on('double-click', () => {
        mainWindow.window.show()
    })
    appIcon.setToolTip(AppSettings.name)

    AppSettings.openDevTools ? mainWindow.window.webContents.openDevTools() : null
    app.dock.hide()
})

setInterval(() => {
    mainWindow.window.webContents.send('log', `Ping each 30s from index.ts. Current version ${autoUpdater.currentVersion}`)
}, 30000)

autoUpdater.on('checking-for-update', () => {
    mainWindow.window.webContents.send('log', 'Checking for update...')
})
autoUpdater.on('update-available', (info) => {
    mainWindow.window.webContents.send('log', 'Update available.')
})
autoUpdater.on('update-not-available', (info) => {
    mainWindow.window.webContents.send('log', 'Update not available.')
})
autoUpdater.on('error', (err) => {
    mainWindow.window.webContents.send('log', 'Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    mainWindow.window.webContents.send('log', log_message)
})
/**
 * If user agereed to auto update his application without notice ( for now ). If disabled, the app will update un manual restart.
 */
autoUpdater.on('update-downloaded', (info) => {
    mainWindow.window.webContents.send('log', 'Update downloaded, restarting in 5 sec')
    if (userSettings.autoRestartOnUpdateAvailable) {
        setTimeout(() => autoUpdater.quitAndInstall(), 5000)
    }
})

app.on('window-all-closed', () => {
    app.quit()
})

app.allowRendererProcessReuse = false

async function createMainWindow() {
    mainWindow = new CustomWindow()
    const urlPage = path.join(__dirname, 'www', 'index.html')
    mainWindow.createWindow(urlPage)
    ioHookHandler.InitIOHook(ipcMain, clipboard, mainWindow.window)
}
