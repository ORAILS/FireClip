<script lang="ts">
    import { RemoteItemStatus, type IClipboardItemFrontend } from '../../types'
    import { timestampToRelativeTime } from '../../util'
    import Icons from './Icons.svelte'

    export let extraClassDiv = ''
    export let item: IClipboardItemFrontend
</script>

<div class="h-full p-2 pr-1 {extraClassDiv} flex flex-row">
    <p class="mr-[2px] text-right text-[10px]">{timestampToRelativeTime(item.modified.getTime())}</p>
    {#if item.remoteStatus == RemoteItemStatus.pushedToRemote || item.remoteStatus == RemoteItemStatus.fetchedFromRemote}
        <Icons icon="check" />
    {:else if item.remoteStatus == RemoteItemStatus.needsUpdateOnRemote}
        <Icons icon="sync" />
    {:else if item.remoteStatus == RemoteItemStatus.existsOnlyLocally}
        <Icons icon="up" />
    {:else}
        <p>no icon</p>
    {/if}
</div>
