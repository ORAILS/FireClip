<script lang="ts">
    import { DateTime } from 'luxon'
    import { delay } from '../KeyboardEventUtil'
    import { sendShortcuts } from '../backendActions'
    import { events, eventsToBackend } from '../events'
    import { currentPage, isAppHidden, isFocused, pressedKeysSizeLimit, shortcutsJson, userPreferences } from '../stores'
    import { IPages, type IShortCut } from '../types'
    import { clipListFiltered, currentScrollIndex, pressedKeys, selectedClipId } from './../stores'
    import Button from './Button.svelte'
    import MenuItem from './MenuItem.svelte'
    import ShortcutButtons from './ShortcutButtons.svelte'
    import ShortcutButtons2d from './ShortcutButtons2d.svelte'
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

    const get1dString = (combination: string[]): string => {
        let representation = `[${combination.join('+')}]`
        if (combination.length === 0) {
            representation = '[nothing pressed]'
        }
        return representation
    }

    const get2dString = (shortcut: string[][]): string => {
        let result = ''
        for (const combination of shortcut) {
            const representation = get1dString(combination)
            if (result.length > 0) {
                result = result + ' -> '
            }
            result = result + representation
        }
        return result
    }

    const shortcutAllowed = async (key: string, delayMsBetweenTriggers: number): Promise<boolean> => {
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
    const shortcutSimpleName = 'combination'
    const shortcutSequenceName = `chain of ${shortcutSimpleName}s`

    let activeShortcutChanged = false
    // when shortcuts are received from the backend.
    shortcutsJson.subscribe((v) => {
        if (!v || v.length === 0) return
        const savedShortcuts: Record<string, string[][][]> = JSON.parse(v)
        for (const key of Object.keys(shortcuts)) {
            if (savedShortcuts[key]) {
                shortcuts[key].combinations = savedShortcuts[key]
            }
        }
    })

    // all existing shortcuts along with defaul combinations
    export let shortcuts: IShortcuts = {
        scroll: {
            combinations: [[['Left Command', '`']]],
            editVisible: false,
            delayMsBetweenTriggers: 100,
            handler: async () => {
                if ($currentPage != IPages.items) {
                    return
                }
                events.notifyBackend(eventsToBackend.windowUnhide)
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
                events.notifyBackend(eventsToBackend.pasteHash, $selectedClipId)
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
                    events.notifyBackend(eventsToBackend.windowFocus)
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
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[0][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste2: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '2']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[1][1].hash)
            },
            combinationChangeHandler: () => {}
        },
        paste3: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '3']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[2][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste4: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '4']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[3][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste5: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '5']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[4][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste6: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '6']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[5][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste7: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '7']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[6][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste8: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '8']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[7][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste9: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '9']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[8][1].hash)
            },
            combinationChangeHandler: () => {}
        },

        paste10: {
            editVisible: false,
            delayMsBetweenTriggers: 100,
            combinations: [[['Left Command', '0']]],
            handler: async () => {
                events.notifyBackend(eventsToBackend.pasteHash, $clipListFiltered[9][1].hash)
            },
            combinationChangeHandler: () => {}
        }
    }

    export const arr1dSameValues = (arr1: string[], arr2: string[]): boolean => {
        if (!arr1 || !arr2) return false
        const res = arr1.sort().join(',') === arr2.sort().join(',')
        return res
    }
    export const arr2dIdentical = (arr1: string[][], arr2: string[][]): boolean => {
        if (!arr1 || !arr2) return false
        if (arr1.length != arr2.length) return false
        for (let index = 0; index < arr1.length; index++) {
            if (!arr1dSameValues(arr1[index], arr2[index])) {
                return false
            }
        }
        return true
    }

    let type = shortcutSimpleName

    let recordedSequence: string[][] = [[]]
    let simplestShortcut: string[] = []
    pressedKeys.subscribe((value) => {
        if ($currentPage != IPages.shortcuts) {
            return
        }
        recordedSequence = value
        const lastPressed = value[value.length - 1]
        if (lastPressed.length >= simplestShortcut.length) {
            simplestShortcut = lastPressed
        }
    })

    const checkShortcuts = async (currentlyPressed: string[][]) => {
        if (!$userPreferences || !$userPreferences.enableKeyboardShortcuts.value) {
            return
        }
        for (const shortcut of entries(shortcuts)) {
            const combinations = shortcut[1].combinations
            for (const combination of combinations) {
                const relevantPressed = currentlyPressed.slice(currentlyPressed.length - combination.length)
                if (arr2dIdentical(combination, relevantPressed)) {
                    const allowed = await shortcutAllowed(shortcut[0], shortcut[1].delayMsBetweenTriggers)
                    if (allowed) {
                        await shortcut[1].handler()
                    }
                }
            }
        }
    }
    export const shortcutExists = (shortcut: string[][]): { exists: boolean; name: string } => {
        for (const s of entries(shortcuts)) {
            for (const combination of s[1].combinations) {
                if (arr2dIdentical(shortcut, combination)) {
                    return { exists: true, name: s[0] }
                }
            }
        }
        return { exists: false, name: '' }
    }
    export const getNameFromKey = (key: string): string => {
        return key.toUpperCase().replaceAll('_', ' ')
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
    <MenuItem>
        <p class="text-xl">Shortcuts</p></MenuItem
    >
    <MenuItem>
        <p
            class="text-xl"
            on:click={() => {
                currentPage.set(IPages.settings)
            }}
        >
            &lt; Back to settings
        </p></MenuItem
    >
    {#each entries(shortcuts) as shortcut}
        <div
            class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
dark:text-gray-200 
even:dark:border-gray-800 
even:dark:bg-slate-900"
        >
            <div class="my-2 flex flex-col">
                <div class="flex flex-row justify-between">
                    <h4>
                        {getNameFromKey(shortcut[0])}
                    </h4>
                    <Button
                        label={shortcut[1].editVisible ? (activeShortcutChanged ? 'Save' : 'Cancel') : 'Edit'}
                        on:click={() => {
                            // closing other edits
                            for (const s of entries(shortcuts)) {
                                if (s[0] != shortcut[0]) {
                                    s[1].editVisible = false
                                }
                            }
                            resetRecorded()
                            shortcut[1].editVisible = !shortcut[1].editVisible
                            if (!shortcut[1].editVisible) {
                                const shortcutToCombination = {}
                                for (const key of Object.keys(shortcuts)) {
                                    shortcutToCombination[key] = shortcuts[key].combinations
                                }
                                sendShortcuts(JSON.stringify(shortcutToCombination))
                                activeShortcutChanged = false
                            }
                        }}
                    />
                </div>
                <!-- <h5>Shortcuts:</h5> -->
                {#each shortcut[1].combinations as combination, index}
                    <div class="flex flex-row justify-between">
                        <div class="flex flex-row">
                            <p>{index + 1}.</p>
                            <ShortcutButtons2d data={combination} />
                        </div>
                        <Button
                            label="Delete"
                            visible={shortcut[1].editVisible}
                            on:click={() => {
                                const yes = confirm(`Delete '${get2dString(shortcut[1].combinations[index])}' shortcut ?`)
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
                            type="select"
                            label="New shortcut kind"
                            title="If set to '{shortcutSimpleName}' a key combination will be recorded and can be used to trigger the action. \n If '{shortcutSequenceName}' is selected, the exact sequence of the buttons needs to be pressed for the shortcut to trigger."
                            fontSize={12}
                            selectOptions={[shortcutSimpleName, shortcutSequenceName]}
                            bind:value={type}
                            on:change={(e) => {
                                type = e.detail
                            }}
                        />
                    </div>
                    {#if type === shortcutSimpleName}
                        <!-- content here -->
                        <div class="flex flex-row items-center ">
                            <p class="mr-2">Recorded combination</p>
                            <ShortcutButtons data={simplestShortcut} />
                        </div>
                    {:else}
                        <div class="mb-6">Recorded sequence</div>
                        <ShortcutButtons2d
                            rootFlex="col"
                            childFlex="col"
                            svgExtraClass="stroke-2 rotate-180"
                            showDelete={true}
                            data={recordedSequence}
                        />
                    {/if}
                    <Button extraClasses="mt-4" label="Reset recorded" on:click={resetRecorded} />
                {/if}
                <Button
                    label="Add recorded shortcut"
                    visible={shortcut[1].editVisible}
                    on:click={() => {
                        if (simplestShortcut.length === 0) {
                            alert('Combination is empty!')
                            return
                        }
                        if (type === shortcutSimpleName) {
                            const recorded = shortcutExists([simplestShortcut])
                            if (recorded.exists) {
                                alert(`Shortcut already exists! Recorded for '${getNameFromKey(recorded.name)}'`)
                                return
                            }
                            shortcut[1].combinations.push([simplestShortcut])
                        } else {
                            const recorded = shortcutExists(recordedSequence)
                            if (recorded.exists) {
                                alert(`Shortcut already exists! Recorded for '${getNameFromKey(recorded.name)}'`)
                                return
                            }
                            shortcut[1].combinations.push(recordedSequence)
                        }
                        activeShortcutChanged = true
                        shortcut[1].combinations = shortcut[1].combinations
                        resetRecorded()
                    }}
                />
            </div>
        </div>
    {/each}
{/if}
