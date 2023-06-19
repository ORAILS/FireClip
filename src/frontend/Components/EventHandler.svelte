<script lang="ts">
    import {
        clipList,
        clipListFiltered,
        currentEvent,
        currentPage,
        currentScrollIndex,
        currentSearchedText,
        isAppHidden,
        isFocused,
        isPasswordAsked,
        isPasswordIncorrect,
        pressedKeys,
        previousEvent,
        selectedClipId,
        userSettings
    } from '../stores'
    import type { IClipboardItem, IHookKeyboardEvent, IHookMouseEvent, IReceiveChannel } from '../types'
    import { IPages } from '../types'
    import {
        arrayToArrayMap,
        delay,
        getKeyName,
        ioHook,
        ipcRenderer,
        isMacShortcutEnd,
        isMacShortcutStart,
        isNumberPasted,
        isSearchShortcut,
        isWinShortcutEnd,
        isWinShortcutStart,
        itemMatchesText,
        keyNames,
        qwertyToDvorak,
        sort
    } from '../KeyboardEventUtil'

    currentSearchedText.subscribe((text: string) => {
        if (text.length == 0) {
            $clipListFiltered = $clipList
            return
        }

        $clipListFiltered = arrayToArrayMap<[string, IClipboardItem]>((i) => itemMatchesText(text, i), $clipList)
    })

    const channelFromBackend: IReceiveChannel[] = [
        {
            name: 'loadItems',
            handler: function (event, store: any[]) {
                $clipListFiltered = sort([...store]).desc((i) => i[1].lastModified)
                $clipList = $clipListFiltered
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
            name: 'askPassword',
            handler: function (event, store) {
                $isPasswordAsked = true
                $currentPage = IPages.login
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
                $currentPage = IPages.shortcuts
            }
        },

        {
            name: 'to.renderer.set.settings',
            handler: (e, value) => {
                $userSettings = JSON.parse(value)
            }
        },

        {
            name: 'to.renderer.open.window',
            handler: (e, value) => {
                const colors = Object.values(IPages).filter((item) => {
                    return isNaN(Number(item))
                })
                if (colors.includes(value)) {
                    // values shows the values first, then the indices, keys does the opposite
                    currentPage.set(Object.values(IPages).indexOf(value))
                }
            }
        }
    ]

    for (const event of channelFromBackend) {
        ipcRenderer.on(event.name, event.handler as never)
    }

    ioHook.on('mouseclick', (event: IHookMouseEvent) => {})

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
        const key = getKeyName(e.keycode, 'dvorak')
        const exists = $pressedKeys.find((k) => k === key)
        if (!exists) {
            const temp = $pressedKeys
            temp.push(key)
            pressedKeys.set(temp)
        }
        currentEvent.set(e)
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
        const key = getKeyName(e.keycode, 'dvorak')
        $pressedKeys = $pressedKeys.filter((k) => k != key)
        currentEvent.set(e)
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
</script>
