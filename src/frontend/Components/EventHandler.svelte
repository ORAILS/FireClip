<script lang="ts">
    import { get } from 'svelte/store'
    import { arrayToArrayMap, getKeyName, ioHook, itemMatchesText, sort } from '../KeyboardEventUtil'
    import { ipcRenderer } from '../events'
    import {
        backendLogs,
        clipList,
        clipListFiltered,
        currentPage,
        currentSearchedText,
        isAppHidden,
        isPasswordAsked,
        isPasswordIncorrect,
        pressedKeys,
        pressedKeysSizeLimit,
        searchOnlyImages,
        shortcutsJson,
        totpConfirmInfo,
        userPreferences
    } from '../stores'
    import type { IClipboardItem, IHookKeyboardEvent, IReceiveChannel } from '../types'
    import { IPages, isImageContent } from '../types'

    currentSearchedText.subscribe((text: string) => {
        if ($searchOnlyImages) {
            return
        }
        if (text.length == 0) {
            $clipListFiltered = $clipList
            return
        }

        clipListFiltered.set(arrayToArrayMap<[string, IClipboardItem]>((i) => itemMatchesText(text, i), $clipList))
    })

    searchOnlyImages.subscribe((v) => {
        if (v) {
            $clipListFiltered = arrayToArrayMap<[string, IClipboardItem]>((i) => isImageContent(i[1]), $clipList)
        } else {
            $clipListFiltered = $clipList
        }
    })

    const channelFromBackend: IReceiveChannel[] = [
        {
            name: 'to.renderer.loadItems',
            handler: function (event, store: any[]) {
                $clipListFiltered = sort([...store]).desc((i) => i[1].modified)
                $clipList = $clipListFiltered
            }
        },
        {
            name: 'to.renderer.hide',
            handler: function (event, store) {
                $isAppHidden = true
            }
        },
        {
            name: 'to.renderer.log',
            handler: async function (event, text) {
                console.log(text)
            }
        },
        {
            name: 'to.renderer.unhide',
            handler: function (event, store) {
                $isAppHidden = false
            }
        },
        {
            name: 'to.renderer.askPassword',
            handler: function (event, store) {
                $isPasswordAsked = true
                $currentPage = IPages.login
            }
        },
        {
            name: 'to.renderer.confirm.totp',
            handler: function (event, body) {
                totpConfirmInfo.set(body)
                currentPage.set(IPages.totpConfirm)
                console.log(body)
            }
        },
        {
            name: 'to.renderer.error.passwordIncorrect',
            handler: function (event, store) {
                $isPasswordIncorrect = true
                setTimeout(() => {
                    $isPasswordIncorrect = false
                }, 3500)
            }
        },

        {
            name: 'to.renderer.passwordConfirmed',
            handler: function (event) {
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
            name: 'to.renderer.alert',
            handler: (e, value) => {
                alert(value)
                addLog(value)
            }
        },
        {
            name: 'to.renderer.log',
            handler: (e, value) => {
                addLog(value)
            }
        },
        {
            name: 'to.renderer.alertWindow',
            handler: (e, value) => {
                alert(value)
            }
        }
    ]
    function addLog(log: string) {
        const logs = get(backendLogs)
        if (logs.length > 1000) {
            logs.pop()
        }
        logs.unshift(log)
        backendLogs.set(logs)
    }

    for (const event of channelFromBackend) {
        ipcRenderer.on(event.name, event.handler as never)
    }

    // do nothing for now
    // ioHook.on('mouseclick', (event: IHookMouseEvent) => {})

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
