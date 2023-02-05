<script lang="ts">
    import { onMount } from 'svelte'
    import {
        clipList,
        clipListFiltered,
        currentScrollIndex,
        isAppHidden,
        isFocused,
        isPasswordAsked,
        isPasswordIncorrect,
        previousEvent,
        selectedClipId,
        userSettings
    } from '../stores'
    import type { IClipboardItem, IHookKeyboardEvent, IHookMouseEvent, IReceiveChannel } from '../types'
    import { isImageContent, isRTFContent, isTextContent } from '../types'
    import { delay, ipcRenderer } from '../util'
    import viewport from '../viewPortAction'
    import IconCommand from './icons/_IconCommand.svelte'
    import Login from './Login.svelte'

    var { sort } = window.require('fast-sort')

    const channelsFromRender: IReceiveChannel[] = [
        {
            name: 'loadItems',
            handler: function (event, store: any[]) {
                const storeSorted = sort([...store]).desc((i) => i[1].lastModified)

                for (const item of storeSorted) {
                    const exists = $clipListFiltered.find((i) => i[0] === item[0])
                    if (!exists) {
                        $clipListFiltered.push(item)
                    } else {
                        exists[1].lastModified = item[1].lastModified
                    }
                }

                $clipListFiltered = sort([...$clipListFiltered]).desc((i) => i[1].lastModified)
                $clipList = $clipListFiltered
                if ($clipListFiltered && $clipListFiltered[0]) {
                    $clipListFiltered[0][1].isVisible = true
                    visibleHashes.push($clipListFiltered[0][0])
                }
            }
        },
        {
            name: 'askPassword',
            handler: function (event, store) {
                $isPasswordAsked = true
            }
        },
        {
            name: 'hide',
            handler: function (event, store) {
                $isAppHidden = true
                console.log(store)
            }
        },
        {
            name: 'log',
            handler: async function (event, store) {
                console.log(store)
            }
        },
        {
            name: 'unhide',
            handler: function (event, store) {
                $isAppHidden = false
                console.log(store)
            }
        },
        {
            name: 'incrementIndex',
            handler: function (event, store) {
                console.log('increment')
            }
        },

        {
            name: 'passwordIncorrect',
            handler: function (event, store) {
                $isPasswordIncorrect = true
                setTimeout(() => {
                    $isPasswordIncorrect = false
                }, 3000)
            }
        },

        {
            name: 'passwordConfirmed',
            handler: function (event, store) {
                $isPasswordAsked = false
            }
        },

        {
            name: 'textSearched',
            handler: function (event, text: string) {
                if (text.length == 0) {
                    $clipListFiltered = $clipList
                    return
                }

                function filterItem(text: string, i: [string, IClipboardItem], caseSensitive = false) {
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

                $clipListFiltered = fil<null, [string, IClipboardItem]>((i) => filterItem(text, i), $clipList)
            }
        }
    ]

    for (const event of channelsFromRender) {
        ipcRenderer.on(event.name, event.handler as never)
    }

    const ioHook = window.require('iohook')

    ioHook.on('mouseclick', (event: IHookMouseEvent) => {})

    const isWinShortcutStart = (e: IHookKeyboardEvent) => {
        return e.rawcode === 192 && e.ctrlKey === true
    }
    const isWinShortcutEnd = (e: IHookKeyboardEvent) => {
        return e.rawcode === 162 && e.ctrlKey == true
    }
    const isMacShortcutStart = (e: IHookKeyboardEvent) => {
        return e.rawcode === 50 && e.metaKey === true
    }
    const isMacShortcutEnd = (e: IHookKeyboardEvent) => {
        return e.rawcode === 55 && e.metaKey === true
    }
    const isSearchShortcut = (e: IHookKeyboardEvent) => {
        return e.rawcode === 16 && e.metaKey === true
    }

    const isNumberPasted = (e: IHookKeyboardEvent) => {
        return e.metaKey === true && e.shiftKey === false && e.ctrlKey === false && e.keycode > 1 && e.keycode < 12
    }

    const getPastedNumber = (e: IHookKeyboardEvent) => {
        if (e.keycode === 11) return 0
        return e.keycode - 1
    }

    function scrollIntoView(element: string) {
        const el = document.getElementById(element)
        if (!el) return
        el.scrollIntoView({
            block: 'nearest'
        })
    }

    ioHook.on('keydown', async (e: IHookKeyboardEvent) => {
        if (isWinShortcutStart(e) || isMacShortcutStart(e)) {
            if ($clipListFiltered && $currentScrollIndex + 1 < $clipListFiltered.length && $clipListFiltered[$currentScrollIndex + 1][0]) {
                $currentScrollIndex++
                $selectedClipId = $clipListFiltered[$currentScrollIndex][0]
                scrollIntoView($selectedClipId)
            }
        }
        $previousEvent = e

        if (!$isAppHidden && isSearchShortcut(e)) {
            ipcRenderer.send('focus', true)
            await delay(100)
            isFocused.set($isFocused + 1)
        }
    })

    ioHook.on('keyup', (e: IHookKeyboardEvent) => {
        // scrolled items, wants and released ctrl
        if (
            $previousEvent &&
            ((isWinShortcutStart($previousEvent) && isWinShortcutEnd(e)) || (isMacShortcutStart($previousEvent) && isMacShortcutEnd(e)))
        ) {
            ipcRenderer.send('paste', $selectedClipId)
            $currentScrollIndex = -1
            $selectedClipId = ''
        }
        if (isNumberPasted(e)) {
            let pastedIndex = getPastedNumber(e)
            pastedIndex = pastedIndex - 1
            if (pastedIndex === -1) pastedIndex = 9

            if ($clipListFiltered[pastedIndex]) {
                ipcRenderer.send('paste', $clipListFiltered[pastedIndex][1].contentHash)
                $currentScrollIndex = -1
                $selectedClipId = ''
            }
        }
        $previousEvent = e
    })

    ioHook.start()

    function getDateFormat(parsed: Date) {
        let date = new Date(parsed)
        let localString = date.toString()
        let parsedArray = localString.split(' ')
        return `${parsedArray[2]} ${parsedArray[1]} ${parsedArray[3]} ${parsedArray[4]}`
    }

    function getTitle(item: IClipboardItem) {
        if (isTextContent(item))
            return item.content + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
        if (isImageContent(item))
            return 'PNG Image' + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
        if (isRTFContent(item))
            return item.content + '\n\nCreated at: ' + getDateFormat(item.created) + '\nUsed at: ' + getDateFormat(item.lastModified)
    }

    function handleClick(item: IClipboardItem) {
        ipcRenderer.send('paste', item.contentHash)
        $currentScrollIndex = -1
        $selectedClipId = ''
    }

    /**
     * Transforming the array to map array
     */
    export const fil = <_, K>(fn: (i: K) => boolean, array: K[]) => {
        const f = [] //final array
        for (let i = 0; i < array.length; i++) {
            if (fn(array[i])) {
                f.push(array[i])
            }
        }
        return f
    }

    onMount(async () => {
        ipcRenderer.send('RendererInit', true)
        setTimeout(() => {
            ipcRenderer.send('loginUser', {
                name: 'me',
                email: 'email',
                password: 'password',
                masterKey: ''
            })
        }, 200)

        ipcRenderer.send('get_settings')
    })

    let visibleHashes: string[] = []

    const handleEnter = (hash: string, content: string) => {
        visibleHashes.push(hash)
        visibleHashes = visibleHashes

        const currentIndex = $clipListFiltered.findIndex((i) => i[0] === hash)
        const next = $clipListFiltered[currentIndex + 1]
        if (next) {
            next[1].isVisible = true
        }
    }
    const handleExit = (hash: string, content: string) => {
        const newArr = visibleHashes.filter((i) => i != hash)
        if (newArr.length < 2) {
            return
        }
        visibleHashes = newArr
    }
    const getPreviousHash = (hash: string, value: number) => {
        const currentIndex = $clipListFiltered.findIndex((i) => i[0] === hash)

        if ($clipListFiltered[currentIndex + value]) {
            return $clipListFiltered[currentIndex + value][0]
        }
        return ''
    }
</script>

{#if $isPasswordAsked}
    <Login />
{/if}

<div class="nosbar flex flex-col">
    {#if $clipListFiltered}
        {#each $clipListFiltered as [key, item]}
            {#if visibleHashes.includes(key) || visibleHashes.includes(getPreviousHash(key, -1)) || visibleHashes.includes(getPreviousHash(key, 1))}
                <item
                    use:viewport
                    on:enterViewport={() => handleEnter(key, item.content)}
                    on:exitViewport={() => handleExit(key, item.content)}
                    title={getTitle(item)}
                    class="clipboard-item border-slate-800 {$selectedClipId === item.contentHash
                        ? 'bg-gray-300 even:bg-gray-300 dark:bg-slate-700 even:dark:bg-slate-700'
                        : 'bg-gray-100 even:bg-white hover:bg-gray-300 dark:bg-rock even:dark:bg-slate-900 dark:hover:bg-slate-700'} dark:text-gray-100 dark:even:border-y"
                    id={item.contentHash}
                    on:click|preventDefault={() => handleClick(item)}
                >
                    <div class="flex">
                        {#if $userSettings.showCommandNumberIcons.value}
                            {#if $clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1 < 10}
                                <IconCommand number={$clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1} />
                            {:else if $clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1 === 10}
                                <IconCommand number={0} />
                            {/if}
                        {/if}
                        {#if isTextContent(item)}
                            <p>{item.content}</p>
                        {:else if isRTFContent(item)}
                            <p>{item.content}</p>
                        {:else if isImageContent(item)}
                            <img src={item.content} alt="Base64png" />
                        {/if}
                    </div>
                </item>
            {/if}
        {/each}
    {:else}
        <p class="mt-3 text-gray-600">No items!</p>
    {/if}
</div>

<style lang="postcss">
    .clipboard-item {
        @apply mx-0 my-auto cursor-pointer overflow-hidden text-clip whitespace-nowrap py-2 pl-2 text-left;
        /* border-bottom: 0.3px solid lightgray; */
        line-height: 15px;
    }
    img {
        max-height: 60px;
    }

    ::selection {
        @apply bg-gray-500 text-white;
    }
</style>
