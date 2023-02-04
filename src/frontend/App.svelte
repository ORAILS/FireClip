<script lang="ts">
    import PageHandler from './Components/PageHandler.svelte'
    import Clips from './Components/Clips.svelte'
    import Notifications from './Components/Notifications.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './stores'
    import './css/tailwind.pcss'

    import EventHandler from './Components/EventHandler.svelte'
    import { page } from './stores'
    import { IPages } from './types'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<EventHandler />
<PageHandler title={$appName}>
    <section class="h-full space-y-6 bg-white dark:bg-slate-900">
        {#if $page === IPages.items}
            <Clips />
        {:else if $page === IPages.settings}
            <Settings />
        {:else if $page === IPages.notifications}
            <Notifications />
        {/if}
    </section>
</PageHandler>

<style lang="postcss">
</style>
