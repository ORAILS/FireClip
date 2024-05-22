<script lang="ts">
    import { events, eventsToBackend } from '../events'
    import { userPreferences } from '../stores'
    import SearchBar from './SearchBar.svelte'
    import TitleBar from './TitleBar.svelte'
    export let title: string = 'Title'

    let appClasses = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : ''

    let outerW = globalThis.outerWidth - 8
    let isMaximized = outerW >= globalThis.screen.availWidth

    $: {
        isMaximized = outerW >= globalThis.screen.availWidth
    }

    userPreferences.subscribe((v) => {
        if (!v) return
        const darkSetting = v.darkMode.value
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (darkSetting === 'on' || (darkSetting === 'system' && isDarkSystem)) {
            appClasses = 'dark'
        } else {
            appClasses = ''
        }
    })

    function minimize() {
        events.notifyBackend(eventsToBackend.windowMinimize)
    }
</script>

<svelte:window bind:outerWidth={outerW} />

<main class="flex flex-col {appClasses}">
    <TitleBar {title} on:clickMinimize={minimize} />
    <div class="nosbar page bg-white dark:bg-rock">
        <slot />
    </div>
    <SearchBar height={10} />
</main>

<style lang="postcss">
    main {
        @apply w-full;
    }
    .page {
        @apply h-full w-full overflow-y-auto p-0;
    }

    .page::-webkit-scrollbar {
        @apply w-[0px];
    }

    .page::-webkit-scrollbar-track {
        @apply w-2 border-l border-none border-gray-600 bg-gray-50 dark:bg-slate-600;
    }
    .page::-webkit-scrollbar-thumb {
        @apply w-2 bg-gray-300 dark:bg-gray-800;
    }
</style>
