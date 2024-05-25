<script lang="ts">
    import Clips from './Components/Clips.svelte'
    import Login from './Components/Login.svelte'
    import Notifications from './Components/Notifications.svelte'
    import PageHandler from './Components/PageHandler.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './stores'
    import './www/tailwind.pcss'

    import EventHandler from './Components/EventHandler.svelte'
    import Info from './Components/Info.svelte'
    import Search from './Components/Search.svelte'
    import ShortcutsHandler from './Components/ShortcutsHandler.svelte'
    import { currentPage } from './stores'
    import { IPages } from './types'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<EventHandler />
<PageHandler title={$appName}>
    <section class="h-full">
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
        {:else if $currentPage === IPages.search}
            <Search />
        {/if}
        <ShortcutsHandler />
    </section>
</PageHandler>

<style lang="postcss">
</style>
