<script lang="ts">
    import { delay, ipcRenderer } from '../KeyboardEventUtil'
    import { isAppHidden, isFocused, currentPage } from '../stores'
    import { IPages, type IShortCut } from '../types'
    import { clipListFiltered, currentScrollIndex, selectedClipId, pressedKeys } from './../stores'
</script>

<div
    class="h-full w-full bg-gray-100 px-2 py-2 pl-3 text-gray-900 even:border-y even:bg-white dark:bg-rock 
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
