<script lang="ts">
    import { backendLogs, currentPage, pressedKeys } from '../stores'
    import { IPages } from '../types'
    import MenuItem from './MenuItem.svelte'
    let keys = []
    pressedKeys.subscribe((v) => {
        keys = reverseArr(v)
    })

    function reverseArr(input: any[]) {
        var ret = new Array()
        for (var i = input.length - 1; i >= 0; i--) {
            ret.push(input[i])
        }
        return ret
    }
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
    <div class="flex flex-col justify-between">
        <div class="flex flex-col">
            <p>Pressed keys:</p>
            {#each keys as key}
                <p class="my-1 border border-black bg-stone-300 dark:bg-slate-700">
                    {key.length > 0 ? key : '[nothing pressed]'}
                </p>
            {/each}
        </div>
        <div class="flex flex-col">
            <p>Logs:</p>
            {#each $backendLogs as log}
                <p class="my-1 border border-black bg-stone-300 dark:bg-slate-700">
                    {log}
                </p>
            {/each}
        </div>
    </div>
</div>
