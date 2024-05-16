<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import Check from './paths/check.svelte'
    import Gear from './paths/gear.svelte'
    import Heart from './paths/heart.svelte'
    import Sync from './paths/sync.svelte'
    import TrashBin from './paths/trash-bin.svelte'
    import Up from './paths/up.svelte'
    const dispatch = createEventDispatcher()

    export let size = 4
    export let extraClass = ''
    export let extraClassDiv = ''

    export let icon: 'sync' | 'check' | 'up' | 'gear' | 'heart' | 'trash-bin' | undefined

    function handleClick(event) {
        dispatch('click')
    }
</script>

<div class="h-{size} w-{size} {extraClassDiv} mx-auto my-auto" on:click|stopPropagation={handleClick}>
    <!-- items offered under MIT license -->
    <!-- https://github.com/gorango/glyphs/blob/main/license -->
    <svg
        class="mx-0 my-auto h-{size} w-{size}
rounded 
stroke-gray-800 hover:cursor-pointer
dark:stroke-white
{extraClass}
"
        on:click|preventDefault={() => {}}
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
        {:else if icon == 'heart'}
            <Heart />
        {:else if icon == 'trash-bin'}
            <TrashBin />
        {:else}
            select an icon
        {/if}
    </svg>
</div>
