<script lang="ts">
    import { delay, ipcRenderer } from '../KeyboardEventUtil'
    import { isAppHidden, isFocused } from '../stores'
    import type { IShortCut } from '../types'
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
                    console.log('paste')
                    ipcRenderer.send('paste', $selectedClipId)
                    $currentScrollIndex = -1
                    $selectedClipId = ''
                }
            }
        ]
    ]
    let allowPull = false

    export const areEqual = (arr1: string[], arr2: string[]): boolean => {
        if (!arr1 || !arr2) return false
        const res = arr1.sort().join(',') === arr2.sort().join(',')
        return res
    }

    let timeout: NodeJS.Timeout

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

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            allowPull = true
        }, 500)
    }
    pressedKeys.subscribe(async (updatedPressed) => {
        allowPull = false
        await checkShortcuts(updatedPressed, true)
    })

    setInterval(async () => {
        await checkShortcuts($pressedKeys, allowPull)
    }, 200)
</script>

<!-- <div
    class="h-full w-full bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
dark:text-gray-200 
even:dark:border-gray-800 
even:dark:bg-slate-900"
>
    <h2>Event</h2>
    <p>
        {JSON.stringify($pressedKeys, undefined, 2)}
        {#each combinationToActionMapping as [key, value]}
            <div class="flex flex-row justify-between">
                <p>
                    {key} -> {#each value.combination as item}
                        "{item}" {value.combination.indexOf(item) === value.combination.length - 1 ? '' : '+'}
                    {:else}
                        not assigned
                    {/each}
                </p>
            </div>
        {/each}
    </p>
</div> -->
