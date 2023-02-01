<script lang="ts">
    import { onMount } from 'svelte'
    import type { IClipboardItem, IHookKeyboardEvent, IHookMouseEvent, IReceiveChannel } from '../types'
    import { isImageContent, isRTFContent, isTextContent } from '../types'
    import IconCommand from './icons/_IconCommand.svelte'
    import Login from './Login.svelte'
    import { ipcRenderer, isFocused, state } from './stores'

    const delay = (delayInms: number) => {
        return new Promise((resolve) => setTimeout(resolve, delayInms))
    }
    var { sort } = window.require('fast-sort')

    const channelsFromRender: IReceiveChannel[] = [
        {
            name: 'loadItems',
            handler: function (event, store) {
                $state.clipboardListFiltered = sort([...store]).desc((i) => i[1].lastModified)
                $state.clipboardList = $state.clipboardListFiltered
            }
        },
        {
            name: 'askPassword',
            handler: function (event, store) {
                $state.isAsked = true
            }
        },
        {
            name: 'hide',
            handler: function (event, store) {
                $state.hidden = true
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
                $state.hidden = false
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
                $state.passwordIncorrect = true
                setTimeout(() => {
                    $state.passwordIncorrect = false
                }, 3000)
            }
        },

        {
            name: 'passwordConfirmed',
            handler: function (event, store) {
                $state.isAsked = false
            }
        },

        {
            name: 'textSearched',
            handler: function (event, text: string) {
                if (text.length == 0) {
                    $state.clipboardListFiltered = $state.clipboardList
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

                $state.clipboardListFiltered = fil<null, [string, IClipboardItem]>((i) => filterItem(text, i), $state.clipboardList)
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
        console.log(e)
        // is scrolling throught list
        if (isWinShortcutStart(e) || isMacShortcutStart(e)) {
            console.log('back')
            if (
                $state.clipboardListFiltered &&
                $state.index + 1 < $state.clipboardListFiltered.length &&
                $state.clipboardListFiltered[$state.index + 1][0]
            ) {
                $state.index++
                $state.itemIdSelected = $state.clipboardListFiltered[$state.index][0]
                scrollIntoView($state.itemIdSelected)
            }
        }
        console.log('previous is keydown')
        $state.previous = e

        if (!$state.hidden && isSearchShortcut(e)) {
            console.log('search')
            ipcRenderer.send('focus', true)
            await delay(100)
            isFocused.set($isFocused + 1)
        }
    })

    ioHook.on('keyup', (e: IHookKeyboardEvent) => {
        // scrolled items, wants and released ctrl
        if (
            $state.previous &&
            ((isWinShortcutStart($state.previous) && isWinShortcutEnd(e)) || (isMacShortcutStart($state.previous) && isMacShortcutEnd(e)))
        ) {
            console.log('paste')
            ipcRenderer.send('paste', $state.itemIdSelected)
            $state.index = -1
            $state.itemIdSelected = ''
        }
        if (isNumberPasted(e)) {
            let index = getPastedNumber(e)
            index = index - 1
            if (index === -1) index = 9

            if ($state.clipboardListFiltered[index]) {
                console.log(index)
                ipcRenderer.send('paste', $state.clipboardListFiltered[index][1].contentHash)
                $state.index = -1
                $state.itemIdSelected = ''
            }
        }
        console.log('previous is keyup')
        $state.previous = e
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
        console.log('paste')
        ipcRenderer.send('paste', item.contentHash)
        $state.index = -1
        $state.itemIdSelected = ''
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

    ipcRenderer.on('setSettings', (e, value) => {
        $state.defaultUserSettings = JSON.parse(value)
    })
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
        setInterval(()=>{
            console.log(
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        }, 3000)
        ipcRenderer.send('get_settings')
    })
</script>

{#if $state.isAsked}
    <Login/>
{/if}

<div class="flex flex-col">
    {#if $state.clipboardListFiltered}
        {#each $state.clipboardListFiltered as [key, item]}
            <div
                title={getTitle(item)}
                class="clipboard-item border-slate-800 {$state.itemIdSelected === item.contentHash ? "bg-gray-300 dark:bg-slate-500 even:bg-gray-300 even:dark:bg-slate-500": "bg-gray-100 even:bg-white even:dark:bg-slate-900 dark:bg-rock hover:bg-gray-300 dark:hover:bg-slate-500"} dark:text-gray-100 dark:even:border-y"
                id={item.contentHash}
                on:click|preventDefault={() => handleClick(item)}
            >
                <div class="flex">
                    {#if $state.defaultUserSettings.showCommandNumberIcons.value}
                        {#if $state.clipboardListFiltered.indexOf($state.clipboardListFiltered.filter((i) => i[0] === key)[0]) + 1 < 10}
                            <IconCommand
                                number={$state.clipboardListFiltered.indexOf($state.clipboardListFiltered.filter((i) => i[0] === key)[0]) +
                                    1}
                            />
                        {:else if $state.clipboardListFiltered.indexOf($state.clipboardListFiltered.filter((i) => i[0] === key)[0]) + 1 === 10}
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
            </div>
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
