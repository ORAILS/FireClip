<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import type { IUserSettings } from '../types'
    import { appName } from './stores'
    import Switch from './Switch.svelte'

    const ipcRenderer = window.require('electron').ipcRenderer
    let initialName: string

    let defaultUserSettings: IUserSettings

    const sendChange = (key: string, newValue: never | any) => {
        ipcRenderer.send(key, newValue)
    }
    onMount(() => {
        initialName = $appName

        appName.set('< Settings')
        ipcRenderer.send('get_settings')
    })
    ipcRenderer.on('setSettings', (e, value) => {
        console.log(e)
        console.log(value)
        defaultUserSettings = JSON.parse(value)
    })
    onDestroy(() => {
        appName.set(initialName)
    })
    function camelToSentence(s: string) {
        let result = s[0].toUpperCase()
        var i = 1
        while (i < s.length) {
            if (s[i].charCodeAt(0) >= 'A'.charCodeAt(0) && s[i].charCodeAt(0) <= 'Z'.charCodeAt(0)) result += '  ' + s[i].toLowerCase()
            else result += s[i]
            i++
        }
        return result
    }
</script>

<div class="settings flex flex-col justify-items-start">
    {#if defaultUserSettings}
        {#each Object.entries(defaultUserSettings) as [key, item]}
            <div class="px-2 py-2 pl-3" title={item.description}>
                <Switch
                    label={camelToSentence(key)}
                    fontSize={12}
                    defaultState={item.value}
                    on:change={(e) => {
                        sendChange(key, { key, value: e.detail })
                    }}
                />
            </div>
        {/each}
    {/if}
</div>

<style lang="postcss">
    div {
        background-color: rgb(246, 246, 246);
    }
    div:nth-child(even) {
        background-color: rgb(255, 255, 255);
    }
</style>
