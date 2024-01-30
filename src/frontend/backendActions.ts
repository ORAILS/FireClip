import { ipcRenderer } from "./KeyboardEventUtil";

export function sendShortcuts(serialized: string) {
  ipcRenderer.send(`to.backend.set.shortcuts`, serialized)
}