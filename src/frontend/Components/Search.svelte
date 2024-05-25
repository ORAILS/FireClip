<script lang="ts">
    import { currentPage, currentSearchedText, searchOnlyImages } from '../stores'
    import { IPages } from '../types'
    import Clips from './Clips.svelte'
    import MenuItem from './MenuItem.svelte'
    import Switch from './Switch.svelte'
    import Icons from './icons/Icons.svelte'
</script>

<div class="flex flex-col">
    <MenuItem title="Go back to the items list">
        <div class="flex flex-row ">
            <Icons icon="arrow-circle" centered={false} extraClass="stroke-2 rotate-[-90deg]" size="8" />
            <p class="text-xl" on:click={() => currentPage.set(IPages.items)}>Back to items</p>
        </div>
    </MenuItem>
    <MenuItem>
        <Switch
            type="boolean"
            label="Show just images"
            title="show images only"
            fontSize={12}
            defaultValue={false}
            on:change={(e) => {
                searchOnlyImages.set(e.detail)
            }}
        />
    </MenuItem>
    <MenuItem>
        <input
            type="text"
            placeholder="Show items containing"
            class="h-full w-full bg-[transparent] placeholder-gray-200"
            bind:value={$currentSearchedText}
            on:change={() => {
                currentSearchedText.set($currentSearchedText)
            }}
        />
    </MenuItem>
    <MenuItem extraClass="pb-4" title="Go back to the items list">
        <p class="text-xl">Search results:</p>
    </MenuItem>
</div>

<Clips />
