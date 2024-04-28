<script lang="ts">
    import Check from './paths/check.svelte'
    import Sync from './paths/sync.svelte'
    import Up from './paths/up.svelte'
    import Gear from './paths/gear.svelte'

    export let size = 4
    export let extraClass = ''
    export let extraClassDiv = ''

    export let icon: 'sync' | 'check' | 'up' | 'gear' | undefined
</script>

<div class="h-{size} w-{size} {extraClassDiv}">
    <!-- items offered under MIT license -->
    <!-- https://github.com/gorango/glyphs/blob/main/license -->
    <svg
        class="mx-0 my-auto h-{size} w-{size}
rounded 
stroke-gray-800 hover:cursor-pointer
dark:stroke-white
{extraClass}
"
        focusable="false"
        fill="none"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
    >
        {#if icon == 'sync'}
            <Sync />
        {:else if icon == 'check'}
            <Check />
        {:else if icon == 'up'}
            <Up />
        {:else if icon == 'gear'}
            <Gear />
        {:else}
            select an icon
        {/if}
    </svg>
</div>
