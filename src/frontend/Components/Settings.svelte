<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import { events, eventsToBackend } from '../events'
    import { appName, clipListFiltered, currentPage, userPreferences } from '../stores'
    import { IPages } from '../types'
    import MenuItem from './MenuItem.svelte'
    import Switch from './Switch.svelte'
    import Icons from './icons/Icons.svelte'

    let initialName: string

    const sendChange = (key: string, newValue: never | any) => {
        events.notify(key, newValue)
    }
    onMount(() => {
        initialName = $appName
        appName.set(`Settings`)
        events.notifyBackend(eventsToBackend.getSettings)
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

    userPreferences.subscribe((v) => console.log(v))

    const sizeOf = (value) => typeSizes[typeof value](value)
</script>

<div class="settings flex cursor-pointer flex-col justify-items-start">
    <MenuItem title="Go back to the items list">
        <div class="flex flex-row ">
            <Icons icon="arrow-circle" centered={false} extraClass="stroke-2 rotate-[-90deg]" size="8" />
            <p class="text-xl" on:click={() => currentPage.set(IPages.items)}>Back to items</p>
        </div>
    </MenuItem>
    <MenuItem title="Open shortcuts configuration">
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
                    value={item.value}
                    selectOptions={item.selectableOptions}
                    on:change={(e) => {
                        sendChange(key, { key, value: e.detail })
                    }}
                />
            </MenuItem>
        {/each}
        <MenuItem title="The number of clips decrypted and loaded into RAM">
            <p>
                Total clips: {$clipListFiltered.length}
            </p>
        </MenuItem>

        <MenuItem title="An estimate of the clips size in RAM">
            <p>
                Total clips size: {Math.round(sizeOf($clipListFiltered) / 1024)} kB
            </p>
        </MenuItem>

        <MenuItem title="Saves the items in an unencrypted form and json format.">
            <p>
                <button
                    on:click={() => {
                        events.notifyBackend(eventsToBackend.saveClips)
                    }}>Save clips as JSON</button
                >
            </p>
        </MenuItem>
    {/if}
    <MenuItem />
    <MenuItem title="Show info about the app.">
        <p on:click={() => currentPage.set(IPages.info)}>Info ></p>
    </MenuItem>
    <MenuItem title="Will logout from the app (requires confirmation).">
        <p
            on:click={() => {
                const c = confirm('confirm logout?')
                if (c) {
                    events.notifyBackend(eventsToBackend.userLogout)
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
                    events.notifyBackend(eventsToBackend.getDataDownloadLink)
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
                    events.notifyBackend(eventsToBackend.deleteData)
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
                    events.notifyBackend(eventsToBackend.deleteDataAccount)
                }
            }}
        >
            Delete account and all my data &gt;
        </p>
    </MenuItem>
    <MenuItem title="Open debug page">
        <p on:click={() => currentPage.set(IPages.debug)}>Debug page &gt;</p>
    </MenuItem>
</div>
