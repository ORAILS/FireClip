import { app, clipboard, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { AppSettings } from './App/AppSettings'
import CustomWindow from './App/CustomWindow'
import { channelsToRender, ioHookHandler } from './App/EventHandler'
import { userPreferences } from './App/UserPreferences'


let mainWindow: CustomWindow
let appIcon: Tray

app.on('ready', async () => {
    await createMainWindow()
    autoUpdater.setFeedURL('https://release.fireclip.net/download/latest')
    autoUpdater.checkForUpdatesAndNotify()

    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify()
    }, 5 * 60 * 1000)

    const iconPath = path.join(__dirname, 'www', 'icons/png/32x32.png')
    const icon = nativeImage.createFromPath(iconPath)

    appIcon = new Tray(icon)

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
                mainWindow.window.webContents.send(channelsToRender.openWindow, 'settings')
            }
        },
        {
            label: 'Shortcuts',
            toolTip: 'Open shortcuts in settings',
            click: () => {
                appIcon
                mainWindow.window.show()
                mainWindow.window.webContents.send(channelsToRender.openWindow, 'shortcuts')
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

    if (AppSettings.openDevTools) {
        console.log("open dev tools!")
        setTimeout(() => {
            mainWindow.window.webContents.openDevTools({ mode: "detach" })
        }, 1000)
    }
    if (AppSettings.isMac) {
        app.dock.hide()
    }
})

setInterval(() => {
    mainWindow.window.webContents.send(channelsToRender.log, `Ping each 30s from index.ts. Current version ${autoUpdater.currentVersion}`)
    // mainWindow.window.reload()
}, 30000)

autoUpdater.on('checking-for-update', () => {
    mainWindow.window.webContents.send(channelsToRender.log, 'Checking for update...')
})
autoUpdater.on('update-available', (info) => {
    mainWindow.window.webContents.send(channelsToRender.log, 'Update available.')
})
autoUpdater.on('update-not-available', (info) => {
    mainWindow.window.webContents.send(channelsToRender.log, 'Update not available.')
})
autoUpdater.on('error', (err) => {
    mainWindow.window.webContents.send(channelsToRender.log, 'Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    mainWindow.window.webContents.send(channelsToRender.log, log_message)
})
/**
 * If user agereed to auto update his application without notice ( for now ). If disabled, the app will update un manual restart.
 */
autoUpdater.on('update-downloaded', (info) => {
    mainWindow.window.webContents.send(channelsToRender.log, 'Update downloaded, restarting in 5 sec')
    if (userPreferences.autoRestartOnUpdateAvailable) {
        setTimeout(() => autoUpdater.quitAndInstall(), 5000)
    }
})

app.on('window-all-closed', () => {
    app.quit()
})


if (AppSettings.isLinux) {
    app.commandLine.appendSwitch('disable-gpu-sandbox');
}

if (AppSettings.enableDevTools && AppSettings.isLinux) {
    const port = '8315'
    console.log(`starting debugging on port: ${port}. Open http://localhost:${port}`)
    app.commandLine.appendSwitch('remote-debugging-port', port);
    app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');
}

function stopProcessReuse() {
    console.log('no more reuse!')
    app.allowRendererProcessReuse = false
}

app.on('ready', () => {
    stopProcessReuse()
})
async function createMainWindow() {
    mainWindow = new CustomWindow()
    const urlPage = path.join(__dirname, 'www', 'index.html')
    stopProcessReuse()
    mainWindow.createWindow(urlPage)
    ioHookHandler.InitIOHook(ipcMain, clipboard, mainWindow.window)
}
