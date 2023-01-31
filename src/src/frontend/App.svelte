<script lang="ts">
    import AppStructure from './Components/AppStructure.svelte'
    import IOHook from './Components/IOHook.svelte'
    import Notifications from './Components/Notifications.svelte'
    import Settings from './Components/Settings.svelte'
    import { appName } from './Components/stores'
    import './css/tailwind.pcss'

    import { page } from './Components/stores'
    import { IPages } from './types'
</script>

<svelte:head>
    <title>{$appName}</title>
</svelte:head>

<AppStructure title={$appName}>
    <section class="h-full space-y-6 bg-white dark:bg-slate-900">
        {#if $page === IPages.items}
            <IOHook />
        {:else if $page === IPages.settings}
            <Settings />
        {:else if $page === IPages.notifications}
            <Notifications />
        {/if}
    </section>
</AppStructure>

<style lang="postcss">
</style>
