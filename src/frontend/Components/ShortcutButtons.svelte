<script lang="ts">
    export let data: string[]
</script>

<div class="flex flex-row items-center">
    {#each data as key}
        <p class="mx-2 rounded border-b-4 border-gray-400 bg-gray-300 px-2 py-1 text-sm font-bold dark:border-neutral-900 dark:bg-zinc-800">
            {key}
        </p>
        {data.indexOf(key) != data.length - 1 ? '+' : ''}
    {:else}
        <p class="mx-2 text-sm rounded border-b-4 dark:border-neutral-900 bg-gray-300 border-gray-400 dark:bg-zinc-800 px-2 py-1 font-bold">
            nothing pressed
        </p>
    {/each}
</div>
