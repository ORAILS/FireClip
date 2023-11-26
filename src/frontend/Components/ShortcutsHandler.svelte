<script lang="ts">
    import { delay, ipcRenderer } from '../KeyboardEventUtil'
    import { isAppHidden, isFocused, currentPage } from '../stores'
    import { IPages, type IShortCut } from '../types'
    import { clipListFiltered, currentScrollIndex, selectedClipId, pressedKeys } from './../stores'

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

    export let combinationToActionMapping: [string, IShortCut][] = [
        [
            'scroll',
            {
                combination: [['Left Command', '`']],
                handler: async () => {
                    if ($currentPage != IPages.items) {
                        console.log('not scrolling, not in items!')
                        return
                    }
                    console.log('scroll')
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
                combination: [[`Left Command`, 'f']],
                handler: async () => {
                    if ($currentPage != IPages.items) {
                        console.log('not searching, not in items!')
                        return
                    }
                    console.log('searched')
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
                combination: [['Left Command', '`'], ['Left Command'], []],
                handler: () => {
                    if ($currentPage != IPages.items) {
                        console.log('not pasting, not in items!')
                        return
                    }
                    console.log('paste')
                    ipcRenderer.send('paste', $selectedClipId)
                    $currentScrollIndex = -1
                    $selectedClipId = ''
                }
            }
        ]
        // [
        //     'paste_nr',
        //     {
        //         combination: [['Left Command', '`'], ['Left Command'], []],
        //         handler: () => {
        //             if ($currentPage != IPages.items) {
        //                 console.log('not pasting, not in items!')
        //                 return
        //             }
        //             console.log('paste')
        //             ipcRenderer.send('paste', $selectedClipId)
        //             $currentScrollIndex = -1
        //             $selectedClipId = ''
        //         }
        //     }
        // ]
    ]

    export const areEqual = (arr1: string[], arr2: string[]): boolean => {
        if (!arr1 || !arr2) return false
        const res = arr1.sort().join(',') === arr2.sort().join(',')
        return res
    }

    const checkShortcuts = async (currentlyPressed: string[][], allow = false) => {
        if (!allow) {
            console.log('not allowed to check shortcuts')
            return
        }
        for (const shortcut of combinationToActionMapping) {
            const combination = shortcut[1].combination
            if (combination.length == 0) continue
            if (combination.length == 1) {
                if (areEqual(combination[0], currentlyPressed[currentlyPressed.length - 1])) {
                    await shortcut[1].handler()
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
                    await shortcut[1].handler()
                }
            }
        }
    }
    pressedKeys.subscribe(async (updatedPressed) => {
        await checkShortcuts(updatedPressed, true)
    })
</script>
