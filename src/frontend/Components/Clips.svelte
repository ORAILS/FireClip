<script lang="ts">
    import { onMount } from 'svelte'
    import { getTitle } from '../KeyboardEventUtil'
    import { events, eventsToBackend } from '../events'
    import { clipListFiltered, currentPage, currentScrollIndex, isPasswordAsked, selectedClipId, userPreferences } from '../stores'
    import type { IClipboardItemFrontend } from '../types'
    import { IPages, isImageContent, isTextContent } from '../types'
    import viewport from '../viewPortAction'
    import ItemInfo from './ItemInfo.svelte'
    import IconCommand from './icons/_IconCommand.svelte'

    let visibleHashes: string[] = []

    let lastFire = ''
    let resetFire: NodeJS.Timeout | undefined
    function loadMoreItemsBefore(hash: string) {
        if (lastFire != hash) {
            lastFire = hash
            events.notifyBackend(eventsToBackend.itemsLoadBeforeHash, hash)
            if (resetFire != undefined) {
                clearTimeout(resetFire)
            }
            resetFire = setTimeout(() => {
                lastFire = ''
            }, 5000)
        }
    }

    function handleClick(item: IClipboardItemFrontend) {
        events.notifyBackend(eventsToBackend.pasteHash, item.hash)
        $currentScrollIndex = -1
        $selectedClipId = ''
    }

    clipListFiltered.subscribe((newValues) => {
        if (newValues && newValues[0]) {
            newValues[0][1].isVisible = true
            visibleHashes.push(newValues[0][0])
        }
    })

    const handleEnter = (hash: string) => {
        visibleHashes.push(hash)
        visibleHashes = visibleHashes
        if (visibleHashes.includes($clipListFiltered[$clipListFiltered.length - 6][1].hash)) {
            loadMoreItemsBefore($clipListFiltered[$clipListFiltered.length - 1][1].hash)
        }
    }
    const handleExit = (hash: string) => {
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
    onMount(() => {
        if ($isPasswordAsked) {
            currentPage.set(IPages.login)
        }
    })
    function saveBlob(blob: any, fileName: string) {
        var a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'

        var url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = fileName
        a.click()
        window.URL.revokeObjectURL(url)
    }
</script>

<div class="nosbar flex flex-col pb-8">
    {#if $clipListFiltered}
        {#each $clipListFiltered as [key, item]}
            {#if visibleHashes.includes(key) || visibleHashes.includes(getPreviousHash(key, -1)) || visibleHashes.includes(getPreviousHash(key, 1)) || visibleHashes.includes(getPreviousHash(key, -2)) || visibleHashes.includes(getPreviousHash(key, 2)) || visibleHashes.includes(getPreviousHash(key, -3)) || visibleHashes.includes(getPreviousHash(key, 3))}
                <item
                    use:viewport
                    on:enterViewport={() => handleEnter(key)}
                    on:exitViewport={() => handleExit(key)}
                    title={getTitle(item)}
                    class="clipboard-item border-zinc-800 {$selectedClipId === item.hash
                        ? 'bg-neutral-300 even:bg-neutral-300 hover:bg-neutral-100 dark:bg-zinc-700 even:dark:bg-zinc-700 dark:hover:bg-zinc-500'
                        : 'bg-neutral-100 even:bg-white hover:bg-neutral-300 dark:bg-neutral-900 even:dark:bg-zinc-900 dark:hover:bg-zinc-700'} dark:text-neutral-100 dark:even:border-y"
                    id={item.hash}
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
                        <div class="my-auto flex h-full w-full flex-row overflow-hidden py-2">
                            {#if isTextContent(item)}
                                <p>{item.content}</p>
                            {:else if isImageContent(item)}
                                <img src={item.content} alt="Base64png" />
                                <div class="ml-1 flex flex-col">
                                    <button
                                        class="m-1 h-8 rounded bg-gray-200 p-1 px-2 shadow dark:bg-neutral-900"
                                        on:click|stopPropagation={async () => {
                                            const img = new Image()
                                            img.src = item.content
                                            await img.decode()
                                            events.notify(eventsToBackend.openImage, item.hash, img.width, img.height)
                                        }}
                                    >
                                        preview</button
                                    >
                                    <button
                                        class="m-1 h-8 rounded bg-gray-200 p-1 px-2 shadow dark:bg-neutral-900"
                                        on:click|stopPropagation={async () => {
                                            const content = item.content.substring(22)
                                            const decodedData = atob(content)
                                            const uInt8Array = new Uint8Array(decodedData.length)

                                            // Insert all character code into uInt8Array
                                            for (let i = 0; i < decodedData.length; ++i) {
                                                uInt8Array[i] = decodedData.charCodeAt(i)
                                            }
                                            const data = new Blob([uInt8Array], { type: 'image/png' })
                                            saveBlob(data, `${item.modified.toISOString()}.png`)
                                        }}
                                    >
                                        save</button
                                    >
                                </div>
                                <!-- TODO RTF CONTENT -->
                            {/if}
                        </div>

                        <ItemInfo {item} extraClassDiv="justify-self-end" />
                    </div>
                </item>
            {/if}
        {/each}
    {:else}
        <p class="mt-3 text-neutral-600">No items!</p>
    {/if}
</div>

<style lang="postcss">
    .clipboard-item {
        @apply cursor-pointer overflow-hidden text-clip whitespace-nowrap p-1 pl-2 text-left;
        /* border-bottom: 0.3px solid lightgray; */
        line-height: 15px;
    }
    img {
        max-height: 75px;
    }

    ::selection {
        @apply bg-neutral-500 text-white;
    }
</style>
