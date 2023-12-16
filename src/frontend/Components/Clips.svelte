<script lang="ts">
    import { getTitle, ipcRenderer } from '../KeyboardEventUtil'
    import { clipListFiltered, currentScrollIndex, selectedClipId, userPreferences } from '../stores'
    import type { IClipboardItem } from '../types'
    import { isImageContent, isRTFContent, isTextContent } from '../types'
    import viewport from '../viewPortAction'
    import IconCommand from './icons/_IconCommand.svelte'

    let visibleHashes: string[] = []

    function handleClick(item: IClipboardItem) {
        ipcRenderer.send('paste', item.contentHash)
        $currentScrollIndex = -1
        $selectedClipId = ''
    }

    clipListFiltered.subscribe((newValues) => {
        if (newValues && newValues[0]) {
            newValues[0][1].isVisible = true
            visibleHashes.push(newValues[0][0])
        }
    })

    const handleEnter = (hash: string, content: string) => {
        visibleHashes.push(hash)
        visibleHashes = visibleHashes
    }
    const handleExit = (hash: string, content: string) => {
        const newArr = visibleHashes.filter((i) => i != hash)
        if (newArr.length < 2) {
            return
        }
        visibleHashes = newArr
    }
    const getPreviousHash = (hash: string, value: number) => {
        const currentIndex = $clipListFiltered.findIndex((i) => i[0] === hash)

        if ($clipListFiltered[currentIndex + value]) {
            return $clipListFiltered[currentIndex + value][0]
        }
        return ''
    }
</script>

<div class="nosbar flex flex-col">
    {#if $clipListFiltered}
        {#each $clipListFiltered as [key, item]}
            {#if visibleHashes.includes(key) || visibleHashes.includes(getPreviousHash(key, -1)) || visibleHashes.includes(getPreviousHash(key, 1)) || visibleHashes.includes(getPreviousHash(key, -2)) || visibleHashes.includes(getPreviousHash(key, 2))}
                <item
                    use:viewport
                    on:enterViewport={() => handleEnter(key, item.content)}
                    on:exitViewport={() => handleExit(key, item.content)}
                    title={getTitle(item)}
                    class="clipboard-item border-slate-800 {$selectedClipId === item.contentHash
                        ? 'bg-gray-300 even:bg-gray-300 dark:bg-slate-700 even:dark:bg-slate-700'
                        : 'bg-gray-100 even:bg-white hover:bg-gray-300 dark:bg-rock even:dark:bg-slate-900 dark:hover:bg-slate-700'} dark:text-gray-100 dark:even:border-y"
                    id={item.contentHash}
                    on:click|preventDefault={() => handleClick(item)}
                >
                    <div class="flex">
                        {#if $userPreferences.showCommandNumberIcons.value}
                            {#if $clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1 < 10}
                                <IconCommand number={$clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1} />
                            {:else if $clipListFiltered.indexOf($clipListFiltered.filter((i) => i[0] === key)[0]) + 1 === 10}
                                <IconCommand number={0} />
                            {/if}
                        {/if}
                        {#if isTextContent(item)}
                            <p>{item.content}</p>
                        {:else if isRTFContent(item)}
                            <p>{item.content}</p>
                        {:else if isImageContent(item)}
                            <img src={item.content} alt="Base64png" />
                        {/if}
                    </div>
                </item>
            {/if}
        {/each}
    {:else}
        <p class="mt-3 text-gray-600">No items!</p>
    {/if}
</div>

<style lang="postcss">
    .clipboard-item {
        @apply mx-0 my-auto cursor-pointer overflow-hidden text-clip whitespace-nowrap py-2 pl-2 text-left;
        /* border-bottom: 0.3px solid lightgray; */
        line-height: 15px;
    }
    img {
        max-height: 75px;
    }

    ::selection {
        @apply bg-gray-500 text-white;
    }
</style>
