<script lang="ts">
    import { currentPage, currentSearchedText, searchOnlyImages } from '../stores'
    import { IPages } from '../types'
    import Clips from './Clips.svelte'
    import MenuItem from './MenuItem.svelte'
    import Switch from './Switch.svelte'
    import Icons from './icons/Icons.svelte'
</script>

<div class="flex flex-col">
    <MenuItem title="Items">
        <div class="flex flex-row ">
            <p class="text-xl" on:click={() => currentPage.set(IPages.items)}>&lt; Items</p>
        </div>
    </MenuItem>
    <MenuItem>
        <Switch
            type="boolean"
            label="Show just images"
            title="show images only"
            fontSize={12}
            on:change={(e) => {
                searchOnlyImages.set(e.detail)
            }}
        />
    </MenuItem>
    <MenuItem extraClass="border-b">
        <input
            type="text"
            placeholder="type text to search"
            class="h-full w-full bg-[transparent] placeholder-neutral-200"
            bind:value={$currentSearchedText}
            on:change={() => {
                currentSearchedText.set($currentSearchedText)
            }}
        />
    </MenuItem>
</div>
<Clips />
