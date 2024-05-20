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
        loginPageMessage,
        pressedKeys,
        pressedKeysSizeLimit,
        shortcutsJson,
        userPreferences
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
                $clipListFiltered = sort([...store]).desc((i) => i[1].modified)
                $clipList = $clipListFiltered
            }
        },
        {
            name: 'hide',
            handler: function (event, store) {
                $isAppHidden = true
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
                $userPreferences = JSON.parse(value)
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
        },
        {
            name: 'to.renderer.set.shortcuts',
            handler: (e, value) => {
                shortcutsJson.set(value)
            }
        },
        {
            name: 'registerOk',
            handler: (e) => {
                console.log('registered successfully')
                loginPageMessage.set('successfully registered! try to login now')
            }
        },
        {
            name: 'to.renderer.success.allDeleted',
            handler: (e, value) => {
                alert("all data was deleted!")
            }
        },
    ]

    for (const event of channelFromBackend) {
        ipcRenderer.on(event.name, event.handler as never)
    }

    // do nothing now
    ioHook.on('mouseclick', (event: IHookMouseEvent) => {})

    ioHook.on('keydown', async (e: IHookKeyboardEvent) => {
        // the settings are send from the back
        if (!$userPreferences) {
            return
        }
        const key = getKeyName(e.keycode, e.rawcode, $userPreferences.keyboardLayout.value)
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
        if (!$userPreferences) {
            return
        }
        const key = getKeyName(e.keycode, e.rawcode, $userPreferences.keyboardLayout.value)
        const temp: string[] = JSON.parse(JSON.stringify($pressedKeys[$pressedKeys.length - 1])).filter((k) => k != key)
        const val = $pressedKeys
        val.push(temp)
        pressedKeys.set(val)
        if ($pressedKeys.length > pressedKeysSizeLimit) {
            $pressedKeys.shift()
        }
    })

    ioHook.start()
</script>
