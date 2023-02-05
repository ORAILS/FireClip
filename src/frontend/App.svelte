<script lang="ts">
    import Clips from './Components/Clips.svelte'
    import Notifications from './Components/Notifications.svelte'
    import PageHandler from './Components/PageHandler.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './stores'
    import './www/tailwind.pcss'

    import EventHandler from './Components/EventHandler.svelte'
    import { currentPage } from './stores'
    import { IPages } from './types'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<EventHandler />
<PageHandler title={$appName}>
    <section class="h-full space-y-6 bg-white dark:bg-slate-900">
        {#if $currentPage === IPages.items}
            <Clips />
        {:else if $currentPage === IPages.settings}
            <Settings />
        {:else if $currentPage === IPages.notifications}
            <Notifications />
        {/if}
    </section>
</PageHandler>

<style lang="postcss">
</style>
