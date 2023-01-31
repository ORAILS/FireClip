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

<footer class="flex h-10 w-full items-center border-t border-t-gray-300 bg-white p-1  font-bold dark:border-t-gray-800 dark:bg-slate-900">
    <input
        bind:this={element}
        class="ml-3 w-full border-none bg-white pr-3 text-gray-600 outline-none dark:bg-slate-900 dark:text-gray-100"
        type="text"
        placeholder="Search"
        bind:value={text}
        on:input={handleChange}
    />
</footer>
