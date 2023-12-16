<script lang="ts">
    import { delay, ipcRenderer } from '../KeyboardEventUtil'
    import { isAppHidden, isFocused, currentPage, userPreferences } from '../stores'
    import { IPages, type IShortCut } from '../types'
    import { clipListFiltered, currentScrollIndex, selectedClipId, pressedKeys } from './../stores'
    import { DateTime } from 'luxon'

    interface IExecutedShortcut {
        key: string
        timestamp: DateTime<boolean>
    }
    // mutable so that we can clean it to not get big enought
    let executedShortcutsHistory: IExecutedShortcut[] = []
    // const recordShortcut = async (key: string) => {
    //     console.log(key)
    //     let combination = combinationToActionMapping.find((i) => i[0] === key)
    //     combination[1].combination = []
    //     let typed = false
    //     while (!typed) {
    //         console.log($pressedKeys)
    //         if ($pressedKeys.length < combination[1].combination.length) {
    //             typed = true
    //             break
    //         }
    //         combination[1].combination = $pressedKeys
    //         combinationToActionMapping = combinationToActionMapping
    //         await delay(100)
    //     }
    // }
    function scrollIntoView(element: string) {
        const el = document.getElementById(element)
        if (!el) return
        el.scrollIntoView({
            block: 'nearest'
        })
    }

    const shortcutAllowed = async (key: string, delayMsBetweenTriggers: number): Promise<boolean> => {
        console.log(key)
        const maxSaved = 20
        const now = DateTime.now()
        const latest = executedShortcutsHistory.find((i) => i.key == key)
        if (latest) {
            const earliestRetrigger = latest.timestamp.plus({ milliseconds: delayMsBetweenTriggers })
            if (now < earliestRetrigger) {
                return false
            }
        }
        executedShortcutsHistory.unshift({ key, timestamp: DateTime.now() })
        executedShortcutsHistory = executedShortcutsHistory.slice(0, maxSaved)
        return true
    }

    export let combinationToActionMapping: [string, IShortCut][] = [
        [
            'scroll',
            {
                combination: [['Left Command', '`']],
                delayMsBetweenTriggers: 100,
                handler: async () => {
                    if ($currentPage != IPages.items) {
                        return
                    }
                    ipcRenderer.send('unhide', true)
                    if (
                        $clipListFiltered &&
                        $currentScrollIndex + 1 < $clipListFiltered.length &&
                        $clipListFiltered[$currentScrollIndex + 1][0]
                    ) {
                        $currentScrollIndex++
                        $selectedClipId = $clipListFiltered[$currentScrollIndex][0]
                        scrollIntoView($selectedClipId)
                    }
                }
            }
        ],
        [
            'search',
            {
                delayMsBetweenTriggers: 100,
                combination: [[`Left Command`, 'f']],
                handler: async () => {
                    if ($currentPage != IPages.items) {
                        return
                    }
                    if (!$isAppHidden) {
                        ipcRenderer.send('focus', true)
                        await delay(100)
                        isFocused.set($isFocused + 1)
                    }
                }
            }
        ],
        [
            'paste',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '`'], ['Left Command'], []],
                handler: () => {
                    if ($currentPage != IPages.items) {
                        return
                    }
                    ipcRenderer.send('paste', $selectedClipId)
                    $currentScrollIndex = -1
                    $selectedClipId = ''
                }
            }
        ],
        [
            'paste_1',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '1']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[0][1].contentHash)
                }
            }
        ],
        [
            'paste_2',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '2']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[1][1].contentHash)
                }
            }
        ],
        [
            'paste_3',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '3']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[2][1].contentHash)
                }
            }
        ],
        [
            'paste_4',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '4']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[3][1].contentHash)
                }
            }
        ],
        [
            'paste_5',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '5']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[4][1].contentHash)
                }
            }
        ],
        [
            'paste_6',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '6']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[5][1].contentHash)
                }
            }
        ],
        [
            'paste_7',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '7']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[6][1].contentHash)
                }
            }
        ],
        [
            'paste_8',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '8']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[7][1].contentHash)
                }
            }
        ],
        [
            'paste_9',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '9']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[8][1].contentHash)
                }
            }
        ],
        [
            'paste_10',
            {
                delayMsBetweenTriggers: 100,
                combination: [['Left Command', '0']],
                handler: async () => {
                    ipcRenderer.send('paste', $clipListFiltered[9][1].contentHash)
                }
            }
        ]
    ]

    export const areEqual = (arr1: string[], arr2: string[]): boolean => {
        if (!arr1 || !arr2) return false
        const res = arr1.sort().join(',') === arr2.sort().join(',')
        return res
    }

    const checkShortcuts = async (currentlyPressed: string[][]) => {
        if (!$userPreferences || !$userPreferences.enableKeyboardShortcuts.value) {
            return
        }
        for (const shortcut of combinationToActionMapping) {
            const combination = shortcut[1].combination
            if (combination.length == 0) continue
            if (combination.length == 1) {
                if (areEqual(combination[0], currentlyPressed[currentlyPressed.length - 1])) {
                    const allowed = await shortcutAllowed(shortcut[0], shortcut[1].delayMsBetweenTriggers)
                    if (allowed) {
                        await shortcut[1].handler()
                    }
                }
            } else {
                let matched = true
                combinLoop: for (let index = 0; index < combination.length; index++) {
                    if (!areEqual(combination[combination.length - index - 1], currentlyPressed[currentlyPressed.length - index - 1])) {
                        matched = false
                        break combinLoop
                    }
                }
                if (matched) {
                    const allowed = await shortcutAllowed(shortcut[0], shortcut[1].delayMsBetweenTriggers)
                    if (allowed) {
                        await shortcut[1].handler()
                    }
                }
            }
        }
    }
    pressedKeys.subscribe(async (pressedKeysArray) => {
        await checkShortcuts(pressedKeysArray)
    })
</script>
