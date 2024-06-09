export const ipcRenderer = window.require('electron').ipcRenderer

export const events = {
  notifyBackend: (notification: typeof eventsToBackend[keyof typeof eventsToBackend], ...args: any[]) => {
    ipcRenderer.send(notification, ...args)
  },
  notify: ipcRenderer.send,
}

export const eventsToBackend = {
  itemAddFavorite: "to.backend.item.add_favorite",
  itemDelete: "to.backend.item.delete",
  pasteHash: "to.backend.item.paste",
  itemsLoadBeforeHash: "to.backend.items.load_before_hash",
  userLogin: "to.backend.user.login",
  userRegister: "to.backend.user.register",
  userLogout: "to.backend.user.logout",
  getSettings: "to.backend.get.settings",
  getShortcuts: "to.backend.get.shortcuts",
  saveClips: "to.backend.save_clips",
  getDataDownloadLink: "to.backend.get.dataDownloadLink",
  deleteData: 'to.backend.delete.allData',
  deleteDataAccount: 'to.backend.delete.allDataAndAccount',
  windowMinimize: "to.backend.window.minimize",
  windowFocus: 'to.backend.window.focus',
  windowUnhide: 'to.backend.window.unhide',
  setShortcuts: `to.backend.set.shortcuts`,
} as const