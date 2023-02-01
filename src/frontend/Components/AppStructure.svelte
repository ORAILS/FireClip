<script lang="ts">
    import SearchBar from './SearchBar.svelte'
    import { ipcRenderer, state } from './stores'
    import TitleBar from './TitleBar.svelte'
    export let title: string = 'Title'

    let appClasses = ''

    let outerW = globalThis.outerWidth - 8
    let isMaximized = outerW >= globalThis.screen.availWidth

    $: {
        isMaximized = outerW >= globalThis.screen.availWidth
    }

    state.subscribe((v) => {
        if (!v.defaultUserSettings) return
        const darkSetting = v.defaultUserSettings.darkMode.value
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (darkSetting === 'on' || (darkSetting === 'system' && isDarkSystem)) {
            appClasses = 'dark'
        } else {
            appClasses = ''
        }
        console.log(appClasses)
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
    <div class="page">
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
        @apply w-[5px];
    }

    .page::-webkit-scrollbar-track {
        @apply border-l border-none border-gray-600 bg-gray-50 dark:bg-slate-600;
    }
    .page::-webkit-scrollbar-thumb {
        @apply bg-gray-300 dark:bg-gray-800;
    }
</style>
