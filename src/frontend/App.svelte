<script lang="ts">
    import Login from './Components/Login.svelte'
    import Clips from './Components/Clips.svelte'
    import Notifications from './Components/Notifications.svelte'
    import PageHandler from './Components/PageHandler.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './stores'
    import './www/tailwind.pcss'

    import EventHandler from './Components/EventHandler.svelte'
    import { currentPage } from './stores'
    import { IPages } from './types'
    import Shortcuts from './Components/Shortcuts.svelte'
    import Info from './Components/Info.svelte'
    import ShortcutsHandler from './Components/ShortcutsHandler.svelte'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<EventHandler />
<PageHandler title={$appName}>
    <section class="h-full space-y-6">
        {#if $currentPage === IPages.login}
            <Login />
        {:else if $currentPage === IPages.items}
            <Clips />
        {:else if $currentPage === IPages.settings}
            <Settings />
        {:else if $currentPage === IPages.notifications}
            <Notifications />
        {:else if $currentPage === IPages.info}
            <Info />
        {/if}
        <ShortcutsHandler />
    </section>
</PageHandler>

<style lang="postcss">
</style>
