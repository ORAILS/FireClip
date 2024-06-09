<script lang="ts">
    import { currentPage, pressedKeys } from '../stores'
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
    <h1>Pressed keys</h1>
    {#each $pressedKeys as key}
        <p>
            {key}
        </p>
    {/each}
</div>
