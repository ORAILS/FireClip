<script lang="ts">
    import { currentSearchedText, isFocused } from '../stores'
    import { ipcRenderer } from '../util'

    let element: HTMLElement
    let text: string = ''

    isFocused.subscribe((v) => {
        if (element) {
            element.focus()
        }
    })

    ipcRenderer.on('searchReset', function (event, store) {
        text = ''
        currentSearchedText.set('')
    })

    function handleChange() {
        currentSearchedText.set(text)
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
