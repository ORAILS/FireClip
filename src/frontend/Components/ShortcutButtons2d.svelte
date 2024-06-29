<script lang="ts">
    import Button from './Button.svelte'
    import ShortcutButtons from './ShortcutButtons.svelte'
    import Icons from './icons/Icons.svelte'

    export let data: string[][]
    export let showDelete = false
    export let rootFlex = 'row'
    export let svgExtraClass = 'rotate-90 stroke-2'
    export let childFlex = 'row'
</script>

<div class="my-1 flex min-h-[min-content] flex-{rootFlex} overflow-auto">
    {#each data as recordedCombination, index}
        <div class="flex flex-{childFlex}">
            <div class="flex w-full flex-row justify-between">
                <ShortcutButtons data={recordedCombination} />
                {#if data.length > 1 && showDelete}
                    <Button
                        label="Delete"
                        on:click={() => {
                            data.splice(index, 1)
                            data = data
                        }}
                    />
                {/if}
            </div>
            {#if index != data.length - 1}
                <Icons icon="arrow" size="8" extraClassDiv="m-1" extraClass={svgExtraClass} />
            {/if}
        </div>
    {/each}
</div>
