<script lang="ts">
    import SearchBar from './SearchBar.svelte'
    const ipcRenderer = window.require('electron').ipcRenderer

    import TitleBar from './TitleBar.svelte'
    export let title: string = 'Title'

    let outerW = globalThis.outerWidth - 8
    let isMaximized = outerW >= globalThis.screen.availWidth

    $: {
        isMaximized = outerW >= globalThis.screen.availWidth
    }

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

<main class="dark">
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
        --background-color: theme('colors.gray.50');
        --text-color: theme('colors.gray.600');
    }
    .page {
        @apply w-full overflow-y-auto p-0;
        height: calc(100% - theme('spacing.8') - theme('spacing.10'));
    }

    .page::-webkit-scrollbar {
        @apply w-[5px];
    }

    .page::-webkit-scrollbar-track {
        @apply border-none;
        background-color: var(--background-color);
        border-color: var(--text-color);
        border-left: 1px solid lightgray;
    }
    .page::-webkit-scrollbar-thumb {
        background-color: lightgray;
    }
</style>
