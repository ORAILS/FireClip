<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import { ipcRenderer } from '../KeyboardEventUtil'
    import { appName, clipListFiltered, currentPage, userPreferences } from '../stores'
    import { IPages } from '../types'
    import MenuItem from './MenuItem.svelte'
    import Switch from './Switch.svelte'

    let initialName: string

    const sendChange = (key: string, newValue: never | any) => {
        ipcRenderer.send(key, newValue)
    }
    onMount(() => {
        initialName = $appName
        appName.set(`Settings`)
        ipcRenderer.send('get_settings')
    })

    onDestroy(() => {
        appName.set(initialName)
    })

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
    <div
        class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
    dark:text-gray-200 
    even:dark:border-gray-800 
    even:dark:bg-slate-900"
    >
        <p on:click={() => currentPage.set(IPages.items)}>&lt; Back to items</p>
    </div>
    <div
        class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
    dark:text-gray-200 
    even:dark:border-gray-800 
    even:dark:bg-slate-900"
    >
        <p on:click={() => currentPage.set(IPages.shortcuts)}>Shortcuts &gt;</p>
    </div>

    {#if $userPreferences}
        {#each Object.entries($userPreferences) as [key, item]}
            <div
                class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
            dark:text-gray-200 
            even:dark:border-gray-800 
            even:dark:bg-slate-900"
                title={item.description}
            >
                <Switch
                    type={item.type}
                    label={item.displayName}
                    fontSize={12}
                    defaultValue={item.value}
                    selectOptions={item.selectableOptions}
                    on:change={(e) => {
                        sendChange(key, { key, value: e.detail })
                    }}
                />
            </div>
        {/each}
        <div
            class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
        dark:text-gray-200 
        even:dark:border-gray-800 
        even:dark:bg-slate-900"
        >
            <p>
                Total items: {$clipListFiltered.length}
            </p>
        </div>
        <div
            class=" bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
        dark:text-gray-200 
        even:dark:border-gray-800 
        even:dark:bg-slate-900"
        >
            <p>
                Total clips size: {Math.round(sizeOf($clipListFiltered) / 1024)} kB
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
                        ipcRenderer.send('save_items', $clipListFiltered)
                    }}>Save state as JSON</button
                >
            </p>
        </div>
    {/if}
    <MenuItem>
        <p on:click={() => currentPage.set(IPages.info)}>Info ></p>
    </MenuItem>
    <MenuItem>
        <p
            on:click={() => {
                const c = confirm('confirm logout?')
                if (c) {
                    ipcRenderer.send('to.backend.user.logout')
                }
            }}
        >
            Logout >
        </p>
    </MenuItem>
    <MenuItem>
        <p
            on:click={() => {
                const c = confirm(
                    'Once confirmed, a link will be written to the clipboard.\nPaste the link in any web browser and all the data (an sqlite database file) will be downloaded.\n\nAnyone with the link can retrieve the database so keep it a secret.\n\nYou can later inspect the database on a site like sqliteviewer.app'
                )
                if (c) {
                    ipcRenderer.send('to.backend.get.allData')
                }
            }}
        >
            Get all my data >
        </p>
    </MenuItem>
    <MenuItem>
        <p
            on:click={() => {
                const c = confirm(
                    'This will delete all your clips (deletes the database file).\nThere is no way back!\n\nMake sure to sign out on other devices as new data will be pushed to a fresh database instance after the deletion.\n\nIt will also log you out on this device.'
                )
                if (c) {
                    ipcRenderer.send('to.backend.delete.allData')
                }
            }}
        >
            Delete all my data >
        </p>
    </MenuItem>
</div>
