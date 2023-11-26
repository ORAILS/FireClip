<script lang="ts">
    import { arrayToArrayMap, getKeyName, ioHook, ipcRenderer, itemMatchesText, sort } from '../KeyboardEventUtil'
    import {
        clipList,
        clipListFiltered,
        currentPage,
        currentSearchedText,
        isAppHidden,
        isPasswordAsked,
        isPasswordIncorrect,
        pressedKeys,
        pressedKeysSizeLimit,
        userSettings
    } from '../stores'
    import type { IClipboardItem, IHookKeyboardEvent, IHookMouseEvent, IReceiveChannel } from '../types'
    import { IPages } from '../types'

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
                $currentPage = IPages.items
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

    ioHook.on('keydown', async (e: IHookKeyboardEvent) => {
        // the settings are send from the back
        if (!$userSettings) {
            return
        }
        const key = getKeyName(e.keycode, e.rawcode, $userSettings.keyboardLayout.value)
        const exists = $pressedKeys[$pressedKeys.length - 1].find((k) => k === key)
        if (!exists) {
            const temp: string[] = JSON.parse(JSON.stringify($pressedKeys[$pressedKeys.length - 1]))
            temp.push(key)
            const val = $pressedKeys
            val.push(temp)
            pressedKeys.set(val)
            if ($pressedKeys.length > pressedKeysSizeLimit) {
                $pressedKeys.shift()
            }
        }
    })

    ioHook.on('keyup', (e: IHookKeyboardEvent) => {
        // the settings are send from the back
        if (!$userSettings) {
            return
        }
        const key = getKeyName(e.keycode, e.rawcode, $userSettings.keyboardLayout.value)
        const temp: string[] = JSON.parse(JSON.stringify($pressedKeys[$pressedKeys.length - 1])).filter((k) => k != key)
        const val = $pressedKeys
        val.push(temp)
        pressedKeys.set(val)
        if ($pressedKeys.length > pressedKeysSizeLimit) {
            $pressedKeys.shift()
        }
        // if (isNumberPasted(e)) {
        //     let pastedIndex = getPastedNumber(e)
        //     pastedIndex = pastedIndex - 1
        //     if (pastedIndex === -1) pastedIndex = 9

        //     if ($clipListFiltered[pastedIndex]) {
        //         ipcRenderer.send('paste', $clipListFiltered[pastedIndex][1].contentHash)
        //         $currentScrollIndex = -1
        //         $selectedClipId = ''
        //     }
        // }
    })

    pressedKeys.subscribe((v) => {})

    ioHook.start()
</script>
