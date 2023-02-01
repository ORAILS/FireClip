<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import type { IUserSettings } from '../types'
    import { appName, state } from './stores'
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
    ipcRenderer.on('to.renderer.set.settings', (e, value) => {
        console.log(e)
        console.log(value)
        defaultUserSettings = JSON.parse(value)
    })
    onDestroy(() => {
        appName.set(initialName)
    })

    /**
     * Used to transform something like "aSentenceThatWork"s to "A sentence that Works".
     */
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

    const typeSizes = {
        undefined: () => 0,
        boolean: () => 4,
        number: () => 8,
        string: (item) => 2 * item.length,
        object: (item) => (!item ? 0 : Object.keys(item).reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0))
    }

    const sizeOf = (value) => typeSizes[typeof value](value)
</script>

<div class="settings flex flex-col justify-items-start">
    {#if defaultUserSettings}
        {#each Object.entries(defaultUserSettings) as [key, item]}
            <div
                class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
            dark:text-gray-200 
            even:dark:border-gray-800 
            even:dark:bg-slate-900"
                title={item.description}
            >
                <Switch
                    label={camelToSentence(key)}
                    fontSize={12}
                    defaultState={item.value}
                    selectOptions={item.selectableOptions}
                    on:change={(e) => {
                        sendChange(key, { key, value: e.detail })
                    }}
                />
            </div>
        {/each}
        <div
            class="bg-gray-100 py-2 px-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
        dark:text-gray-200 
        even:dark:border-gray-800 
        even:dark:bg-slate-900"
        >
            <p>
                Total items: {$state.clipboardListFiltered.length}
            </p>
        </div>
        <div
            class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
        dark:text-gray-200 
        even:dark:border-gray-800 
        even:dark:bg-slate-900"
        >
            <p>
                Size: {sizeOf($state.clipboardListFiltered) / 1024} kB
            </p>
        </div>
        <div
            class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
        dark:text-gray-200 
        even:dark:border-gray-800 
        even:dark:bg-slate-900"
        >
            <p>
                <button
                    on:click={() => {
                        ipcRenderer.send('save_items', $state.clipboardListFiltered)
                    }}>Save state as JSON</button
                >
            </p>
        </div>
    {/if}
</div>

<style lang="postcss">
</style>