<script lang="ts">
    import { backendLogs, currentPage, pressedKeys } from '../stores'
    import { IPages } from '../types'
    import MenuItem from './MenuItem.svelte'
</script>

<MenuItem>
    <p
        class="text-xl"
        on:click={() => {
            currentPage.set(IPages.settings)
        }}
    >
        &lt; Back to settings
    </p></MenuItem
>
<div
    class="bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
dark:text-gray-200 
even:dark:border-gray-800 
even:dark:bg-slate-900"
>
    <div class="flex flex-row justify-between">
        <div class="flex flex-col">
            <p>Pressed keys</p>
            {#each $pressedKeys as key}
                <p>
                    {key}
                </p>
            {/each}
        </div>
        <div class="flex flex-col">
            <p>logs</p>
            {#each $backendLogs as log}
                <p>
                    {log}
                </p>
            {/each}
        </div>
    </div>
</div>
