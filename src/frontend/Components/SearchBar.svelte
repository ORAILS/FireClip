<script lang="ts">
    import { currentPage, currentSearchedText, isFocused } from '../stores'
    import { IPages } from '../types'
    import Icons from './icons/Icons.svelte'

    let element: HTMLElement
    let text: string = ''
    export let height = 10

    isFocused.subscribe((v) => {
        if (element) {
            element.focus()
        }
    })

    // maybe ? in case the search is reset from backend
    // currentSearchedText.subscribe(v=> {
    //     text = v
    // })

    function handleChange() {
        currentSearchedText.set(text)
    }
</script>

{#if $currentPage == IPages.items}
    <footer
        class="flex h-{height} w-full items-center border-t border-t-gray-300 bg-white p-1  font-bold dark:border-t-gray-800 dark:bg-slate-900"
    >
        <input
            bind:this={element}
            class="ml-3 w-full border-none bg-white pr-3 text-gray-600 outline-none dark:bg-slate-900 dark:text-gray-100"
            type="text"
            placeholder="Search"
            bind:value={text}
            on:input={handleChange}
        />
        <div
            class="ml-1 flex h-6"
            on:click={() => {
                console.log('clicked')
                currentPage.set(IPages.settings)
            }}
        >
            <Icons icon="gear" title="Open settings" stopPropagation={false} size="6" />
        </div>
    </footer>
{/if}
