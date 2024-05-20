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
    <MenuItem>
        <p class="text-xl" on:click={() => currentPage.set(IPages.items)}>&lt; Back to items</p>
    </MenuItem>
    <MenuItem>
        <p on:click={() => currentPage.set(IPages.shortcuts)}>Shortcuts &gt;</p>
    </MenuItem>

    {#if $userPreferences}
        {#each Object.entries($userPreferences) as [key, item]}
            <MenuItem title={item.description}>
                <Switch
                    type={item.type}
                    label={item.displayName}
                    title={item.description}
                    fontSize={12}
                    defaultValue={item.value}
                    selectOptions={item.selectableOptions}
                    on:change={(e) => {
                        sendChange(key, { key, value: e.detail })
                    }}
                />
            </MenuItem>
        {/each}
        <MenuItem>
            <p>
                Total items: {$clipListFiltered.length}
            </p>
        </MenuItem>

        <MenuItem>
            <p>
                Total clips size: {Math.round(sizeOf($clipListFiltered) / 1024)} kB
            </p>
        </MenuItem>

        <MenuItem>
            <p>
                <button
                    on:click={() => {
                        ipcRenderer.send('save_items', $clipListFiltered)
                    }}>Save state as JSON</button
                >
            </p>
        </MenuItem>
    {/if}
    <MenuItem />
    <MenuItem>
        <p on:click={() => currentPage.set(IPages.info)}>Info ></p>
    </MenuItem>
    <MenuItem title="Will logout from the app (requires confirmation).">
        <p
            on:click={() => {
                const c = confirm('confirm logout?')
                if (c) {
                    ipcRenderer.send('to.backend.user.logout')
                }
            }}
        >
            Logout &gt;
        </p>
    </MenuItem>
    <MenuItem title="Will give a link where all the data can be downloaded (requires confirmation).">
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
            Get all my data &gt;
        </p>
    </MenuItem>
    <MenuItem title="Will delete all the data (the entire database containing the clips), but not the account (requires confirmation).">
        <p
            on:click={() => {
                const c = confirm(
                    'This will delete all your clips (deletes the database file).\nThere is no way back!\n\nNew data from other instances will be pushed to a fresh database instance after the deletion, unless you log out on all instances.\n\nIt will also log you out on this device.\nThe user account will not be deleted!'
                )
                if (c) {
                    ipcRenderer.send('to.backend.delete.allData')
                }
            }}
        >
            Delete all my data &gt;
        </p>
    </MenuItem>
    <MenuItem title="Will delete all the data(same as above) and also the account (requires confirmation).">
        <p
            on:click={() => {
                const c = confirm(
                    'This will delete all your clips (deletes the database file) and the account!\nThere is no way back!\n\nMake sure to sign out on other devices before proceeding as for a time of up to 1h, new data might get pushed to a fresh database instance created after this deletion (created on demand).\n\nIt will also log you out on this device.'
                )
                if (c) {
                    ipcRenderer.send('to.backend.delete.allDataAndAccount')
                }
            }}
        >
            Delete account and all my data &gt;
        </p>
    </MenuItem>
</div>
