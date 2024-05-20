<script lang="ts">
    import { ipcRenderer } from '../KeyboardEventUtil'
    import { RemoteItemStatus, type IClipboardItemFrontend } from '../types'
    import { timestampToRelativeTime } from '../util'
    import Icons from './icons/Icons.svelte'

    export let extraClassDiv = ''
    export let item: IClipboardItemFrontend
    async function deleteItem() {
        ipcRenderer.send('delete', item.hash)
    }
    async function addFavorite() {
        ipcRenderer.send('add_favorite', item.hash)
    }
</script>

<div class="my-auto h-full min-w-8 p-1 {extraClassDiv} flex cursor-auto flex-row justify-items-center">
    <div class="flex flex-col">
        <p class="mx-auto text-[10px]">{timestampToRelativeTime(item.modified.getTime()).replace('.', '')}</p>
        <Icons icon="heart" title="add/remove favorites" filled={item.isFavorite} on:click={addFavorite} />
    </div>
    <div class="flex flex-col">
        {#if item.remoteStatus == RemoteItemStatus.pushedToRemote || item.remoteStatus == RemoteItemStatus.fetchedFromRemote}
            <Icons icon="check" title="status: fetched from remote" />
        {:else if item.remoteStatus == RemoteItemStatus.needsUpdateOnRemote}
            <Icons icon="sync" title="status: needs update on remote" />
        {:else if item.remoteStatus == RemoteItemStatus.existsOnlyLocally}
            <Icons icon="up" title="status: exists only locally" />
        {:else}
            <p>no icon</p>
        {/if}
        <Icons icon="trash-bin" title="delete" on:click={deleteItem} />
    </div>
</div>
