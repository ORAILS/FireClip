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

export const keyNames = {
    0: '§',
    1: 'Esc',
    2: '1',
    3: '2',
    4: '3',
    5: '4',
    6: '5',
    7: '6',
    8: '7',
    9: '8',
    11: '0',
    10: '9',
    79: '1',
    80: '2',
    81: '3',
    75: '4',
    76: '5',
    77: '6',
    71: '7',
    72: '8',
    73: '9',
    82: '0',
    12: '-',
    13: '=',
    15: 'Tab',
    16: 'q',
    17: 'w',
    18: 'e',
    19: 'r',
    20: 't',
    21: 'y',
    22: 'u',
    23: 'i',
    24: 'o',
    25: 'p',
    26: '[',
    27: ']',
    30: 'a',
    31: 's',
    32: 'd',
    33: 'f',
    34: 'g',
    35: 'h',
    36: 'j',
    37: 'k',
    38: 'l',
    39: ';',
    40: "'",
    41: '`',
    43: '\\',
    44: 'z',
    45: 'x',
    46: 'c',
    47: 'v',
    48: 'b',
    49: 'n',
    50: 'm',
    51: ',',
    52: '.',
    53: '/',
    14: 'Backspace',
    3667: 'Forwardspace',
    28: 'Enter',
    58: 'CapsLock',
    57: 'Space',
    57388: 'Eject',
    29: 'Left Ctrl',
    3613: 'Right Ctrl',
    42: 'Left Shift',
    54: 'Right Shift',
    56: 'Left Alt',
    3640: 'Right Alt',
    3675: 'Left Win',
    3676: 'Right Win',
    59: 'F1',
    60: 'F2',
    61: 'F3',
    62: 'F4',
    63: 'F5',
    64: 'F6',
    65: 'F7',
    66: 'F8',
    67: 'F9',
    68: 'F10',
    87: 'F11',
    88: 'F12',
    91: 'F13',
    92: 'F14',
    93: 'F15',
    99: 'F16',
    100: 'F17',
    101: 'F18',
    102: 'F19',
    69: 'Clear',
    61010: 'Insert',
    61011: 'Delete',
    60999: 'Home',
    61007: 'End',
    61001: 'Page Up',
    61009: 'Page Down',
    3639: 'Print Screen',
    3653: 'Pause Break',
    3637: 'Num /',
    55: 'Num *',
    3597: 'Num =',
    74: 'Num -',
    78: 'Num +',
    83: 'Num .',
    3612: 'Num Enter',
    3655: 'Num Home',
    3657: 'Num Page Up',
    3663: 'Num End',
    3665: 'Num Page Down',
    57420: 'Num Center 5',
    3677: 'Context Menu',
    61008: 'Arrow Down',
    61005: 'Arrow Right',
    61003: 'Arrow Left',
    61000: 'Arrow Up',
    57380: 'Media Stop',
    57360: 'Media Previous',
    57378: 'Media Play',
    57369: 'Media Next',
    57390: 'Volume Down',
    57392: 'Volume Up',
    57376: 'Volume Mute',
    57419: '←',
    57416: '↑',
    57424: '↓',
    57421: '→'
}

export const macRawKeys = {
    145: 'Brightness Down',
    144: 'Brightness Up',
    160: 'Missioncontrol',
    131: 'Launchpad',
    238: 'Eject',
    179: 'Function'
}
export const qwertyToDvorak = {
    q: "'",
    w: ',',
    e: '.',
    r: 'p',
    t: 'y',
    y: 'f',
    u: 'g',
    i: 'c',
    o: 'r',
    p: 'l',
    '[': '/',
    ']': '=',
    '\\': '\\',
    a: 'a',
    s: 'o',
    d: 'e',
    f: 'u',
    g: 'i',
    h: 'd',
    j: 'h',
    k: 't',
    l: 'n',
    ';': 's',
    "'": '-',
    z: ';',
    x: 'q',
    c: 'j',
    v: 'k',
    b: 'x',
    n: 'b',
    m: 'm',
    ',': 'w',
    '.': 'v',
    '/': 'z',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
    '-': '_',
    '=': '+',
    '`': '`',
    '~': '~',
    '!': '!',
    '@': '@',
    '#': '#',
    $: '$',
    '%': '%',
    '^': '^',
    '&': '&',
    '*': '*',
    '(': '(',
    ')': ')',
    _: '-',
    '+': '=',
    '\t': '\t',
    '\n': '\n',
    '\r': '\r',
    ' ': ' '
}

export const getKeyName = (
    keycode: number,
    rawcode: number,
    layout: 'qwerty' | 'dvorak' = 'qwerty',
    platform: 'mac' | 'win' = 'mac'
): string => {
    if (macRawKeys[rawcode]) {
        return macRawKeys[rawcode]
    }
    const result = keyNames[keycode]
    if (layout === 'dvorak') {
        const dvorak = qwertyToDvorak[result]
        if (dvorak && dvorak != null) {
            return dvorak
        }
    }
    if (platform === 'mac') {
        return result.replace(/Win/g, 'Command').replace(/Alt/g, 'Option')
    }
    return result
}
