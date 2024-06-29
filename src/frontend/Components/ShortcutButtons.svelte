<script lang="ts">
    export let data: string[]
</script>

<div class="flex flex-row items-center">
    {#each data as key}
        <p class="mx-2 rounded border-b-4 border-stone-900 bg-slate-800 px-2 py-1 text-sm font-bold">{key}</p>
        {data.indexOf(key) != data.length - 1 ? '+' : ''}
    {:else}
        <p class="mx-2 text-sm rounded border-b-4 border-stone-900 bg-slate-800 px-2 py-1 font-bold">nothing pressed</p>
    {/each}
</div>
