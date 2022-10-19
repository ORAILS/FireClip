<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    const ipcRenderer = window.require('electron').ipcRenderer
    import { isFocused } from './stores'
    let element: HTMLElement
    let text: string = ''

    isFocused.subscribe((v) => {
        console.log(v)
        if (element) {
            element.focus()
        }
    })

    ipcRenderer.on('searchReset', function (event, store) {
        text = ''
    })

    function handleChange() {
        ipcRenderer.send('textSearched', text)
    }
</script>

<footer>
    <input bind:this={element} class="input-class" type="text" placeholder="Search" bind:value={text} on:input={handleChange} />
</footer>

<style lang="postcss">
    footer {
        @apply h-10 w-full p-1 font-bold flex items-center;
        border-top: 1px solid lightgray;
        background-color: var(--background-color, theme('colors.gray.800'));
        color: var(--text-color, theme('colors.gray.200'));
    }

    .input-class {
        @apply border-none outline-none ml-3 w-full pr-3;
        background-color: var(--background-color, theme('colors.gray.800'));
    }
</style>
