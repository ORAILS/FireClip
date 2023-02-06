import type { IClipboardItem, IHookKeyboardEvent } from './types'
import { isImageContent, isRTFContent, isTextContent } from './types'

export const ipcRenderer = window.require('electron').ipcRenderer
export const ioHook = window.require('iohook')
export const { sort } = window.require('fast-sort')

export const delay = (delayInms: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms))
}

export const getTitle = (item: IClipboardItem) => {
    if (isTextContent(item))
        return item.content + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
    if (isImageContent(item))
        return 'PNG Image' + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
    if (isRTFContent(item))
        return item.content + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
}

/**
 * Transforming the array to map array
 */
export const arrayToArrayMap = <K>(fn: (i: K) => boolean, array: K[]) => {
    const f = [] //final array
    for (let i = 0; i < array.length; i++) {
        if (fn(array[i])) {
            f.push(array[i])
        }
    }
    return f
}

/**
 * Return true if an item fulfils the condition inside
 */
export const itemMatchesText = (text: string, i: [string, IClipboardItem], caseSensitive = false): boolean => {
    let itemContent = i[1].content
    if (!caseSensitive) {
        itemContent = itemContent.toLowerCase()
        text = text.toLowerCase()
    }

    let result = false

    result = (isTextContent(i[1]) || isRTFContent(i[1])) && (itemContent.includes(text) || itemContent === text)

    if (text.toLowerCase() === 'image') result = result || isImageContent(i[1])

    return result
}

export const isWinShortcutStart = (e: IHookKeyboardEvent) => {
    return e.rawcode === 192 && e.ctrlKey === true
}
export const isWinShortcutEnd = (e: IHookKeyboardEvent) => {
    return e.rawcode === 162 && e.ctrlKey == true
}
export const isMacShortcutStart = (e: IHookKeyboardEvent) => {
    return e.rawcode === 50 && e.metaKey === true
}
export const isMacShortcutEnd = (e: IHookKeyboardEvent) => {
    return e.rawcode === 55 && e.metaKey === true
}
export const isSearchShortcut = (e: IHookKeyboardEvent) => {
    return e.rawcode === 16 && e.metaKey === true
}

export const isNumberPasted = (e: IHookKeyboardEvent) => {
    return e.metaKey === true && e.shiftKey === false && e.ctrlKey === false && e.keycode > 1 && e.keycode < 12
}

export const getDateFormat = (parsed: Date) => {
    const date = new Date(parsed)
    const localString = date.toString()
    const parsedArray = localString.split(' ')
    return `${parsedArray[2]} ${parsedArray[1]} ${parsedArray[3]} ${parsedArray[4]}`
}
