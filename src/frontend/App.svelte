<script lang="ts">
    import AppStructure from './Components/AppStructure.svelte'
    import Clips from './Components/Clips.svelte'
    import Notifications from './Components/Notifications.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './Components/stores'
    import './css/tailwind.pcss'

    import { page } from './Components/stores'
    import { IPages } from './types'
    import EventHandler from './Components/EventHandler.svelte'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<EventHandler />
<AppStructure title={$appName}>
    <section class="h-full space-y-6 bg-white dark:bg-slate-900">
        {#if $page === IPages.items}
            <Clips />
        {:else if $page === IPages.settings}
            <Settings />
        {:else if $page === IPages.notifications}
            <Notifications />
        {/if}
    </section>
</AppStructure>

<style lang="postcss">
</style>
