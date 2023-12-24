<script lang="ts">
    import { DateTime } from 'luxon'
    import { delay, ipcRenderer } from '../KeyboardEventUtil'
    import { currentPage, isAppHidden, isFocused, pressedKeysSizeLimit, userPreferences } from '../stores'
    import { IPages, type IShortCut } from '../types'
    import { clipListFiltered, currentScrollIndex, pressedKeys, selectedClipId } from './../stores'
    import Button from './Button.svelte'
    import Switch from './Switch.svelte'

    interface IExecutedShortcut {
        key: string
        timestamp: DateTime<boolean>
    }
    // mutable so that we can clean it to not get big enought
    let executedShortcutsHistory: IExecutedShortcut[] = []

    function scrollIntoView(element: string) {
        const el = document.getElementById(element)
        if (!el) return
        el.scrollIntoView({
            block: 'nearest'
        })
    }

    const shortcutAllowed = async (key: string, delayMsBetweenTriggers: number): Promise<boolean> => {
        // console.log(key)
        const now = DateTime.now()
        const latest = executedShortcutsHistory.find((i) => i.key == key)
        if (latest) {
            const earliestRetrigger = latest.timestamp.plus({ milliseconds: delayMsBetweenTriggers })
            if (now < earliestRetrigger) {
                return false
            }
        }
        executedShortcutsHistory.unshift({ key, timestamp: DateTime.now() })
        executedShortcutsHistory = executedShortcutsHistory.slice(0, pressedKeysSizeLimit)
        return true
    }

    interface IShortcuts {
        scroll: IShortCut
        close_and_paste: IShortCut
        search: IShortCut
        paste1: IShortCut
        paste2: IShortCut
        paste3: IShortCut
        paste4: IShortCut
        paste5: IShortCut
        paste6: IShortCut
        paste7: IShortCut
        paste8: IShortCut
        paste9: IShortCut
        paste10: IShortCut
    }

    export let shortcuts: IShortcuts = {
        scroll: {
            combinations: [[['Left Command', '`']], [['Left Command', 'j']]],
            editVisible: false,
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
            },
            combinationChangeHandler: (newCombination: string[][][]) => {}
        },

        close_and_paste: {
            combinations: [[['Left Command', '`'], ['Left Command'], []]],
            editVisible: false,
            delayMsBetweenTriggers: 100,
            handler: () => {
                if ($currentPage != IPages.items) {
                    return
                }
                ipcRenderer.send('paste', $selectedClipId)
                $currentScrollIndex = -1
                $selectedClipId = ''
            },
            combinationChangeHandler: (newCombination: string[][][]) => {}
        },
        search: {
            delayMsBetweenTriggers: 100,
            editVisible: false,
            combinations: [[[`Left Command`, 'f']]],
            handler: async () => {
                if ($currentPage != IPages.items) {
                    return
                }
                if (!$isAppHidden) {
                    ipcRenderer.send('focus', true)
                    await delay(100)
                    isFocused.set($isFocused + 1)
                }
            },
            combinationChangeHandler: () => {}
        },
        paste1: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '1']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[0][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste2: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '2']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[1][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },
        paste3: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '3']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[2][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste4: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '4']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[3][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste5: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '5']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[4][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste6: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '6']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[5][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste7: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '7']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[6][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste8: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '8']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[7][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste9: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '9']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[8][1].contentHash)
            },
            combinationChangeHandler: () => {}
        },

        paste10: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '0']]],
            handler: async () => {
                ipcRenderer.send('paste', $clipListFiltered[9][1].contentHash)
            },
            combinationChangeHandler: () => {}
        }
    }

    export const areEqual = (arr1: string[], arr2: string[]): boolean => {
        if (!arr1 || !arr2) return false
        const res = arr1.sort().join(',') === arr2.sort().join(',')
        return res
    }

    let simpleMode = false

    let recordedShortcuts: string[][] = [[]]
    let simplestShortcut: string[] = []
    pressedKeys.subscribe((value) => {
        if ($currentPage != IPages.shortcuts) {
            return
        }
        console.log('Pressed keys changed!')
        recordedShortcuts = value
        const lastPressed = value[value.length - 1]
        if (lastPressed.length >= simplestShortcut.length) {
            simplestShortcut = lastPressed
        }
    })

    const checkShortcuts = async (currentlyPressed: string[][]) => {
        console.log('checking!')
        if (!$userPreferences || !$userPreferences.enableKeyboardShortcuts.value) {
            return
        }
        for (const shortcut of entries(shortcuts)) {
            const combinations = shortcut[1].combinations
            for (const combination of combinations) {
                if (combination.length == 0) continue
                if (combination.length == 1) {
                    if (areEqual(combination[0], currentlyPressed[currentlyPressed.length - 1])) {
                        const allowed = await shortcutAllowed(shortcut[0], shortcut[1].delayMsBetweenTriggers)
                        if (allowed) {
                            console.log(`running handler for ${shortcut[0]}`)
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
                            console.log(`running handler for ${shortcut[0]}`)
                            await shortcut[1].handler()
                        }
                    }
                }
            }
        }
    }
    export const resetRecorded = () => {
        console.log('reseted!')
        simplestShortcut = []
        // recordedShortcuts = [[]]
        pressedKeys.set([[]])
    }
    currentPage.subscribe((v) => {
        if (v == IPages.shortcuts) {
            resetRecorded()
        }
    })
    pressedKeys.subscribe(async (pressedKeysArray) => {
        await checkShortcuts(pressedKeysArray)
    })
    const entries = <K extends string, V>(o: Record<K, V>) => Object.entries(o) as [K, V][]
</script>

{#if $currentPage === IPages.shortcuts}
    {#each entries(shortcuts) as shortcut}
        <div
            class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
dark:text-gray-200 
even:dark:border-gray-800 
even:dark:bg-slate-900"
        >
            <div class=" my-6 flex flex-col">
                <div class="flex flex-row justify-between">
                    <h4>
                        {shortcut[0].toUpperCase().replaceAll('_', ' ')}
                    </h4>
                    <Button
                        label={shortcut[1].editVisible ? 'Close' : 'Edit'}
                        on:click={() => {
                            resetRecorded()
                            shortcut[1].editVisible = !shortcut[1].editVisible
                            // closing other edits
                            for (const s of entries(shortcuts)) {
                                if (s[0] != shortcut[0]) {
                                    s[1].editVisible = false
                                }
                            }
                        }}
                    />
                </div>
                <h5>Shortcuts:</h5>
                {#each shortcut[1].combinations as combination, index}
                    <div class="flex flex-row justify-between">
                        <p>{JSON.stringify(combination)}</p>
                        <Button
                            label="Delete"
                            visible={shortcut[1].editVisible}
                            on:click={() => {
                                console.log(index)
                                const yes = confirm('Delete shortcut combination ?')
                                if (yes) {
                                    shortcut[1].combinations.splice(index, 1)
                                    shortcut[1].combinations = shortcut[1].combinations
                                }
                            }}
                        />
                    </div>
                {/each}
                {#if shortcut[1].editVisible}
                    <div class="div my-2">
                        <Switch
                            type="toggle"
                            label="Simple shortcut"
                            fontSize={12}
                            defaultValue={simpleMode}
                            bind:value={simpleMode}
                            on:change={(e) => {
                                simpleMode = e.detail
                            }}
                        />
                    </div>
                    <h3>
                        Recorded shortcut:
                        {#if simpleMode}
                            <!-- content here -->
                            {JSON.stringify(simplestShortcut)}
                        {:else}
                            <!-- else content here -->
                            {#each recordedShortcuts as keys, index}
                                <div class="flex flex-row justify-between">
                                    <p>{JSON.stringify(keys)}</p>
                                    {#if recordedShortcuts.length > 1}
                                        <Button
                                            label="Delete"
                                            on:click={() => {
                                                recordedShortcuts.splice(index, 1)
                                                recordedShortcuts = recordedShortcuts
                                            }}
                                        />
                                    {/if}
                                </div>
                            {/each}
                        {/if}
                    </h3>
                    <Button label="Reset" on:click={resetRecorded} />
                {/if}
                <Button
                    label="Save"
                    visible={shortcut[1].editVisible}
                    on:click={() => {
                        if (simpleMode) {
                            shortcut[1].combinations.push([simplestShortcut])
                        } else {
                            shortcut[1].combinations.push(recordedShortcuts)
                        }
                        shortcut[1].combinations = shortcut[1].combinations
                        resetRecorded()
                    }}
                />
            </div>
        </div>
    {/each}
{/if}
