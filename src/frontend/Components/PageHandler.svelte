<script lang="ts">
    import { defaultUserSettings } from '../stores'
    import { ipcRenderer } from '../util'
    import SearchBar from './SearchBar.svelte'
    import TitleBar from './TitleBar.svelte'
    export let title: string = 'Title'

    let appClasses = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : ''

    let outerW = globalThis.outerWidth - 8
    let isMaximized = outerW >= globalThis.screen.availWidth

    $: {
        isMaximized = outerW >= globalThis.screen.availWidth
    }

    defaultUserSettings.subscribe((v) => {
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
        ipcRenderer.send('window_minimize', true)
    }
    function maximize() {
        globalThis.api.windowControls.send('maximize', null)
    }
    function close() {
        ipcRenderer.send('window_close', true)
    }
    function unmaximize() {
        globalThis.api.windowControls.send('unmaximize', null)
    }
</script>

<svelte:window bind:outerWidth={outerW} />

<main class={appClasses}>
    <TitleBar
        {title}
        {isMaximized}
        on:clickMinimize={minimize}
        on:clickUnmaximize={unmaximize}
        on:clickMaximize={maximize}
        on:clickClose={close}
    />
    <div class="nosbar page">
        <slot />
    </div>
    <SearchBar />
</main>

<style lang="postcss">
    main {
        @apply w-full;
    }
    .page {
        @apply w-full overflow-y-auto p-0;
        height: calc(100% - theme('spacing.8') - theme('spacing.10'));
    }

    .page::-webkit-scrollbar {
        @apply w-[0px];
    }

    .page::-webkit-scrollbar-track {
        @apply border-l border-none border-gray-600 bg-gray-50 dark:bg-slate-600;
    }
    .page::-webkit-scrollbar-thumb {
        @apply bg-gray-300 dark:bg-gray-800;
    }
</style>
