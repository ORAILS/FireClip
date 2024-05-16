<script lang="ts">
    import { ipcRenderer } from '../../KeyboardEventUtil'
    import { RemoteItemStatus, type IClipboardItemFrontend } from '../../types'
    import { timestampToRelativeTime } from '../../util'
    import Icons from './Icons.svelte'

    export let extraClassDiv = ''
    export let item: IClipboardItemFrontend
    async function deleteItem() {
        ipcRenderer.send('delete', item.hash)
    }
</script>

<div class="h-full min-w-8 p-1 {extraClassDiv} flex cursor-auto flex-row justify-items-center">
    <div class="flex flex-col">
        <p class="mx-auto text-[10px]">{timestampToRelativeTime(item.modified.getTime())}</p>
        <Icons icon="heart" />
    </div>
    <div class="flex flex-col">
        {#if item.remoteStatus == RemoteItemStatus.pushedToRemote || item.remoteStatus == RemoteItemStatus.fetchedFromRemote}
            <Icons icon="check" />
        {:else if item.remoteStatus == RemoteItemStatus.needsUpdateOnRemote}
            <Icons icon="sync" />
        {:else if item.remoteStatus == RemoteItemStatus.existsOnlyLocally}
            <Icons icon="up" />
        {:else}
            <p>no icon</p>
        {/if}
        <Icons icon="trash-bin" on:click={deleteItem} />
    </div>
</div>
